import QRCode from 'react-native-qrcode-svg'
import Toast from 'react-native-toast-message'
import IcoCopy from '../../../../../svg/IcoCopy'
import { api } from '../../../../../service/api'
import React, { useEffect, useRef, useState } from 'react'
import { colors } from '../../../../../styles/colors'
import { useIsFocused } from '@react-navigation/native'
import H3 from '../../../../../components/typography/H3'
import H5 from '../../../../../components/typography/H5'
import 'text-encoding';
import Clipboard from '@react-native-clipboard/clipboard'
import { useNavigate } from '../../../../../hooks/useNavigate'
import Caption from '../../../../../components/typography/Caption'
import AsyncStorage from '@react-native-async-storage/async-storage'
import InputOutlined from '../../../../../components/forms/InputOutlined'
import FilledButton from '../../../../../components/buttons/FilledButton'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import { useDadosPagamento } from '../../../../../stores/useDadosPagamento'
import ValidarCPF from '../../../../../components/forms/ValidarCPF'
import {
  Image,
  Animated,
  View,
  TouchableOpacity,
  Modal,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native'
import MainLayoutAutenticado from '../../../../../components/layout/MainLayoutAutenticado'
import InputArea from '../../../../../components/forms/InputArea'
import { usePaymentPix } from '../../../../../hooks/usePaymentPix'

interface IDadosPix {
  codigo_pix: string,
  id: number,
  uuid: string,
  endereco_entrega: string,
  status: string,
  data: string,
  total: string,
  forma_pagamento: string,
}
interface IDadosUsuario {
  cpf_represetante: string,
  endereco: string,
  nome_represetante: string,
  telefone: string,
  id: string,
  cnpj: string,
  email: string,
}

function aplicarMascaraCpf(value: string) {
  const v = value.replace(/\D/g, '').slice(0, 11)
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function extrairMensagemErro(error: any): string {
  const d = error?.response?.data
  if (!d) return ''
  if (typeof d.message === 'string') return d.message
  const err = d.errors
  if (err && typeof err === 'object') {
    const first =
      err.cpf?.[0] ??
      err.cpf_represetante?.[0] ??
      err.cpf_representante?.[0]
    if (first) return String(first)
  }
  if (typeof d.erro === 'string') return d.erro
  return ''
}

function mensagemIndicaCpfInvalido(msg: string): boolean {
  const m = (msg || '').toLowerCase()
  if (!m.includes('cpf')) return false
  return (
    m.includes('inválido') ||
    m.includes('invalido') ||
    m.includes('invalid') ||
    m.includes('incorreto') ||
    m.includes('inválida') ||
    m.includes('válido') ||
    m.includes('valido')
  )
}

function respostaApiIndicaErroCpf(error: any): boolean {
  const err = error?.response?.data?.errors
  if (!err || typeof err !== 'object') return false
  return !!(err.cpf || err.cpf_represetante || err.cpf_representante)
}

export default function ClientePagamentoPixScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const { getPaymentPixStatus, paymentPixStatus } = usePaymentPix();
  const [seconds, setSeconds] = useState(300)
  const [timeOut, setTimeOut] = useState(false)
  const [loading, setLoading] = useState(true)
  const { dadosPagamento } = useDadosPagamento()
  const [codigoPix, setCodigoPix] = useState('')
  const [dadosPix, setDadosPix] = useState<IDadosPix>()
  const [mensagemErroPix, setMensagemErroPix] = useState<string | null>(null)
  const [modalCpfVisivel, setModalCpfVisivel] = useState(false)
  const [cpfModal, setCpfModal] = useState('')
  const [salvandoCpf, setSalvandoCpf] = useState(false)
  const progressAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (seconds === 300) {
      progressAnimation.setValue(0); // Reset the animation value

      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: seconds * 1000, // 5 minutes in milliseconds
        useNativeDriver: false,
      }).start(); // Restart the animation
    }
  }, [seconds]);

  async function postPix() {
    setLoading(true)
    setMensagemErroPix(null)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    const jsonPerfil = await AsyncStorage.getItem('dados-perfil')

    if (!jsonValue || !jsonPerfil) {
      setMensagemErroPix(
        'Não foi possível carregar seus dados. Verifique se está logado e tente novamente.',
      )
      setCodigoPix('')
      setDadosPix(undefined)
      setTimeOut(false)
      setSeconds(300)
      setLoading(false)
      return
    }

    const newJson = JSON.parse(jsonValue)
    const newJsonPerfil = JSON.parse(jsonPerfil)

    try {
      const responseJuridico = (await api.get(
        `/perfil/pessoa-juridica/${newJsonPerfil.id}`,
      )) as any

      const perfil = responseJuridico.data.results
      const cpfBruto = perfil?.cpf_represetante ?? ''
      setCpfModal(aplicarMascaraCpf(String(cpfBruto)))

      const cpfSoNumeros = String(cpfBruto).replace(/\D/g, '')
      const cpfLocalValido =
        cpfSoNumeros.length === 11 && ValidarCPF({ cpf: cpfSoNumeros })
      if (!cpfLocalValido) {
        setMensagemErroPix(
          'O CPF do representante precisa ser válido para gerar o Pix. Atualize o CPF abaixo.',
        )
        setModalCpfVisivel(true)
        setCodigoPix('')
        setDadosPix(undefined)
        setTimeOut(false)
        setSeconds(300)
        return
      }

      const formData = {
        plano_id: dadosPagamento.id_pacote,
        email: perfil.email,
        telefone: perfil.telefone,
        cpf: perfil.cpf_represetante,
        nome: perfil.nome_represetante,
      }
      const headers = {
        Authorization: `Bearer ${newJson.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      const response = await api.post(`/pagamento/avulso/pix`, formData, { headers })
      const transacao = response.data?.results?.transacao
      const codigo = transacao?.codigo_pix

      if (!transacao || !codigo || String(codigo).trim() === '') {
        setMensagemErroPix(
          'Não foi possível obter o QR Code Pix. Tente novamente em instantes.',
        )
        setCodigoPix('')
        setDadosPix(undefined)
        setTimeOut(false)
        setSeconds(300)
        return
      }

      setTimeOut(false)
      setSeconds(300)
      setDadosPix(transacao)
      setCodigoPix(codigo)
    } catch (error: any) {
      console.error('ERRO dados Pix Avulso: ', error)
      const apiMsg = extrairMensagemErro(error)
      const textoExibir =
        typeof apiMsg === 'string' && apiMsg.length > 0
          ? apiMsg
          : 'Não foi possível gerar o pagamento Pix. Verifique sua conexão e tente novamente.'
      setMensagemErroPix(textoExibir)
      const focoCpf =
        mensagemIndicaCpfInvalido(textoExibir) || respostaApiIndicaErroCpf(error)
      if (focoCpf) {
        setModalCpfVisivel(true)
      }
      setCodigoPix('')
      setDadosPix(undefined)
      setTimeOut(false)
      setSeconds(300)
    } finally {
      setLoading(false)
    }
  }

  async function salvarCpfRepresentante() {
    const digitos = cpfModal.replace(/\D/g, '')
    if (digitos.length !== 11 || !ValidarCPF({ cpf: digitos })) {
      Toast.show({
        type: 'error',
        text1: 'Informe um CPF válido.',
      })
      return
    }
    setSalvandoCpf(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (!jsonValue) {
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada. Faça login novamente.',
        })
        return
      }
      const newJson = JSON.parse(jsonValue)
      const headers = { Authorization: `Bearer ${newJson.token}` }
      const response = await api.post(
        `/altera/anunciante`,
        {
          cpf_represetante: digitos,
          cpf_representante: digitos,
        },
        { headers },
      )
      if (response.data?.error) {
        throw new Error(response.data?.message || 'Erro ao atualizar')
      }
      const jsonPerfil = await AsyncStorage.getItem('dados-perfil')
      if (jsonPerfil) {
        const p = JSON.parse(jsonPerfil)
        p.cpf_represetante = digitos
        await AsyncStorage.setItem('dados-perfil', JSON.stringify(p))
      }
      Toast.show({ type: 'success', text1: 'CPF atualizado!' })
      setModalCpfVisivel(false)
      setMensagemErroPix(null)
      await postPix()
    } catch (err: any) {
      const m = extrairMensagemErro(err) || err?.message
      Toast.show({
        type: 'error',
        text1:
          typeof m === 'string' && m.length > 0
            ? m
            : 'Não foi possível atualizar o CPF.',
      })
    } finally {
      setSalvandoCpf(false)
    }
  }

  const widthInterpolation = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  })

  function formatTime(seconds: any) {
    const minutos = Math.floor(seconds / 60);
    const segundosRestantes = seconds % 60;
    if (segundosRestantes < 10) {
      return `0${minutos}:0${segundosRestantes}`;
    }
    return `0${minutos}:${segundosRestantes}`;
  }

  const copyToClipboard = () => {
    Clipboard.setString(codigoPix)
    Toast.show({
      type: 'success',
      text1: 'Código copiado com sucesso!',
    })
  }

  useEffect(() => {
    if (!timeOut) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      if (seconds === 0) {
        clearInterval(interval);
        setTimeOut(true);
      }

      return () => {
        clearInterval(interval);
      };
    }
  }, [seconds, timeOut]);


  useEffect(() => {
    if (isFocused) {
      let checkPaymentInterval: any;
      if (!paymentPixStatus && dadosPix?.id) {
        checkPaymentInterval = setInterval(() => {
          getPaymentPixStatus(String(dadosPix?.id ?? ''));
        }, 5000);
      }

      return () => {
        if (checkPaymentInterval) {
          clearInterval(checkPaymentInterval);
        }
      };
    }
  }, [paymentPixStatus, dadosPix, isFocused]);

  useEffect(() => {
    postPix()
    setSeconds(300)
  }, [isFocused])

  return (
    <MainLayoutAutenticado loading={loading} marginTop={0} marginHorizontal={0}>
      <HeaderPrimary voltarScreen={() => navigate('ClienteTipoPagamentoScreen')} titulo='Realizar pagamento' />
      <View className='mx-7 mt-5 justify-between'>
        <View>
          <H5>Seu pedido está aguardando o pagamento</H5>
          <Caption>
            Ao clicar no botão abaixo, você vai copiar o código pix. Utilize o Pix copia e cola no aplicativo que você vai fazer o pagamento.
          </Caption>
          <View className='h-2'></View>
          <View
            className='flex-row items-center justify-center rounded mt-4 px-4 py-4'
            style={{ backgroundColor: '#E9E8E8' }}
          >
            <Image className='mr-1' source={require('../../../../../../assets/img/icons/pix.png')} />
            <H5>Pagar com pix</H5>
          </View>
          <View>
            <View className='my-8 w-full'>
              {mensagemErroPix && !loading && (
                <View className='mb-6 px-1'>
                  <Caption align="center" color="#B45309">
                    {mensagemErroPix}
                  </Caption>
                  <View className="mt-4">
                    <FilledButton title="Tentar novamente" onPress={postPix} />
                  </View>
                  {(mensagemIndicaCpfInvalido(mensagemErroPix || '') ||
                    (mensagemErroPix || '').toLowerCase().includes('representante')) && (
                    <View className="mt-3">
                      <Pressable onPress={() => setModalCpfVisivel(true)}>
                        <Text className="text-center text-[#4F46E5] font-semibold">
                          Atualizar CPF do representante
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
              {dadosPix && !mensagemErroPix && (
                <View className='mx-auto mb-4'>
                  <H3 color={colors.secondary70}>Valor total R$:{dadosPix.total}</H3>
                </View>
              )}
              {codigoPix && codigoPix.length > 0 && !timeOut && !mensagemErroPix && (
                <View className='mx-auto'>
                  <QRCode
                    size={180}
                    logoSize={40}
                    value={codigoPix}
                    logoBackgroundColor='transparent'
                  />
                </View>
              )}
              {codigoPix && codigoPix.length > 0 && !timeOut && !mensagemErroPix && (
                <View className='relative'>
                  <InputArea
                    mt={20}
                    height={172}
                    label=''
                    editable={false}
                    keyboardType={''}
                    value={codigoPix}
                    onChange={() => { }}
                  />
                  <TouchableOpacity onPress={copyToClipboard} className='absolute top-[40px] right-2 z-50'>
                    <IcoCopy color={colors.secondary70} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {!mensagemErroPix && (
              <>
                <Caption align={'center'}>
                  Você tem até 5 minutos para fazer o pagamento.
                </Caption>
                <View className='mt-4'>
                  <Caption color='#ADAAAF'>
                    O tempo para pagamento acaba em:
                  </Caption>

                  <H5 color='#2F009C'>{formatTime(seconds)}</H5>

                  <View style={{ width: '100%', height: 4, backgroundColor: colors.primary80 }}>
                    <Animated.View
                      style={{
                        width: widthInterpolation,
                        height: '100%',
                        backgroundColor: colors.primary20,
                      }}
                    />
                  </View>
                </View>
              </>
            )}
          </View>

        </View>
        <View className='h-4'></View>
        <View>
          {timeOut &&
            <View className='mb-2 mt-4'>
              <FilledButton
                title='Voltar e tentar novamente'
                onPress={() => navigate('ClienteTipoPagamentoScreen')}
              />
            </View>
          }
        </View>

      </View>

      <Modal
        visible={modalCpfVisivel}
        animationType="slide"
        transparent
        onRequestClose={() => setModalCpfVisivel(false)}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1 }}>
            <Pressable
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
              onPress={() => setModalCpfVisivel(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View className="rounded-t-3xl bg-white px-5 pt-6 pb-8">
                <Text className="text-lg font-semibold text-[#111] mb-1">
                  CPF do representante
                </Text>
                <Caption color="#6B7280">
                  O pagamento Pix exige um CPF válido. Informe apenas o CPF do
                  representante da empresa.
                </Caption>
                <View className="mt-4">
                  <InputOutlined
                    label="CPF"
                    value={cpfModal}
                    keyboardType="number-pad"
                    maxLength={14}
                    onChange={(text: string) =>
                      setCpfModal(aplicarMascaraCpf(text))
                    }
                  />
                </View>
                <View className="mt-6">
                  <FilledButton
                    title={salvandoCpf ? 'Salvando...' : 'Salvar CPF'}
                    onPress={salvarCpfRepresentante}
                    disabled={salvandoCpf}
                  />
                </View>
                <View className="mt-3">
                  <Pressable onPress={() => setModalCpfVisivel(false)}>
                    <Text className="text-center text-[#6B7280]">Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </MainLayoutAutenticado>
  );
}