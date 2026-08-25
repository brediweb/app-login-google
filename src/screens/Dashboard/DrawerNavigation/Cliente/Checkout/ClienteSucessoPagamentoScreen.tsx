import { View, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import LottieView from 'lottie-react-native'
import { api } from '../../../../../service/api'
import { colors } from '../../../../../styles/colors'
import H3 from '../../../../../components/typography/H3'
import { useNavigate } from '../../../../../hooks/useNavigate'
import Caption from '../../../../../components/typography/Caption'
import Paragrafo from '../../../../../components/typography/Paragrafo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FilledButton from '../../../../../components/buttons/FilledButton'
import { useDadosPagamento } from '../../../../../stores/useDadosPagamento'
import MainLayoutSecondary from '../../../../../components/layout/MainLayoutSecondary'
import { useIsFocused } from '@react-navigation/native'
import React from 'react'

export default function ClienteSucessoPagamentoScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sucesso, setSucesso] = useState(false)
  const { dadosPagamento } = useDadosPagamento()
  const [messageErro, setMessageErro] = useState('')

  function getErrorMessage(error: any): string {
    const data = error?.response?.data
    if (!data) return ''
    if (typeof data === 'object' && typeof data.message === 'string') return data.message
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return parsed?.message && typeof parsed.message === 'string' ? parsed.message : ''
      } catch {
        return ''
      }
    }
    return ''
  }

  async function onSubmitPagamentoRecorrente() {
    setLoading(true)
    setMessageErro('')
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const formData = {
          nome: dadosPagamento.nome_pessoa,
          numero_cartao: dadosPagamento.numero_cartao,
          validade: dadosPagamento.data_validade,
          cpf: dadosPagamento.cpf_titular,
          cvc: dadosPagamento.codigo_cvc,
          endereco: dadosPagamento.endereco_cobranca,
          numero: dadosPagamento.endereco_numero,
          cep: dadosPagamento.endereco_cep,
          uf: dadosPagamento.endereco_uf,
          cidade: dadosPagamento.endereco_cidade,
          planos: [
            dadosPagamento.id_pacote
          ]
        }

        const response = await api.post(`/pagamento/assinatura`, formData, { headers })
        setSucesso(true)
      } catch (error: any) {
        setMessageErro(getErrorMessage(error))
      }
    }
    setLoading(false)
  }

  async function onSubmitPagamentoAvulso() {
    setLoading(true)
    setMessageErro('')
    const jsonValue = await AsyncStorage.getItem('infos-user')
    const jsonPerfil = await AsyncStorage.getItem('dados-perfil')
    if (jsonValue && jsonPerfil) {
      const newJson = JSON.parse(jsonValue)
      const jsonPefil = JSON.parse(jsonPerfil)

      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const formData = {
          card_holder_name: dadosPagamento.nome_pessoa,
          card_cvv: dadosPagamento.codigo_cvc,
          card_number: dadosPagamento.numero_cartao,
          card_expiration_date: dadosPagamento.data_validade,
          cpf: dadosPagamento.cpf_titular,
          parcelas: "1",
          endereco: dadosPagamento.endereco_cobranca,
          numero: dadosPagamento.endereco_numero,
          cep: dadosPagamento.endereco_cep,
          uf: dadosPagamento.endereco_uf,
          cidade: dadosPagamento.endereco_cidade,
          plano_id: dadosPagamento.id_pacote
        }

        const response = await api.post(`/pagamento/avulso/cartao`, formData, { headers })
        setSucesso(true)
      } catch (error: any) {
        setMessageErro(getErrorMessage(error))
      }
    }
    setLoading(false)
  }

  function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.slice(0, maxLength) + '...';
    }
  }

  useEffect(() => {
    if (dadosPagamento.tipo_assinatura === 'Recorrente') {
      onSubmitPagamentoRecorrente()
      return;
    } else {
      onSubmitPagamentoAvulso()
      return;
    }
  }, [isFocused])

  return (
    <MainLayoutSecondary loading={loading}>
      {!loading &&
        <>
          {sucesso ? (
            <View className='mx-7 mt-5 flex-1'>
              <View className='flex-1 justify-center items-center mb-4'>
                <View style={styles.animationWrap}>
                  <LottieView style={styles.animation} source={require('../../../../../animations/pacote-comprado.json')} autoPlay loop />
                </View>
                <View style={styles.messageCardSuccess}>
                  <H3 align='center' color={colors.primary20}>
                    Pagamento realizado com sucesso!
                  </H3>
                  <Caption align='center' color={colors.neutralvariant50} margintop={8}>
                    Seu plano foi confirmado. Aproveite!
                  </Caption>
                </View>
              </View>
              <FilledButton
                onPress={() => navigate('ClienteTabNavigation', { screen: 'HomeClienteScreen' })}
                title='Continuar'
              />
            </View>
          ) : (
            <View className='mx-7 mt-5 flex-1'>
              <View className='flex-1 justify-center items-center mb-4'>
                <View style={styles.animationWrap}>
                  <LottieView style={styles.animation} source={require('../../../../../animations/pagamento-falhou.json')} autoPlay loop />
                </View>
                <View style={styles.messageCardError}>
                  <H3 align='center' color={colors.error20}>
                    Algo deu errado
                  </H3>
                  <Paragrafo
                    title={messageErro || 'Ocorreu um erro ao finalizar seu pagamento. Verifique os dados e tente novamente.'}
                    color={colors.neutral10}
                    align='center'
                  />
                </View>
              </View>
              <FilledButton
                onPress={() => navigate('ClientePagamentoEndereco', { screen: 'HomeClienteScreen' })}
                title='Voltar e tentar novamente'
              />
            </View>
          )}
        </>
      }
    </MainLayoutSecondary>
  )
}

const styles = StyleSheet.create({
  animationWrap: {
    marginBottom: 24,
  },
  animation: {
    width: 260,
    height: 260,
  },
  messageCardSuccess: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.primary90,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary80,
  },
  messageCardError: {
    width: '100%',
    backgroundColor: colors.error90,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error80,
  },
})