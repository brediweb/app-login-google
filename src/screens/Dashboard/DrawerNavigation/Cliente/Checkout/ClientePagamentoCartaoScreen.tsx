import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import H5 from '../../../../../components/typography/H5'
import { ScrollView } from 'react-native-gesture-handler'
import { useNavigate } from '../../../../../hooks/useNavigate'
import Caption from '../../../../../components/typography/Caption'
import ValidarCPF from '../../../../../components/forms/ValidarCPF'
import InputOutlined from '../../../../../components/forms/InputOutlined'
import FilledButton from '../../../../../components/buttons/FilledButton'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import { useDadosPagamento } from '../../../../../stores/useDadosPagamento'
import InputMascaraPaper from '../../../../../components/forms/InputMascaraPaper'
import { Image, KeyboardAvoidingView, StyleSheet, Platform, Text, View } from 'react-native'
import MainLayoutAutenticadoSemScroll from '../../../../../components/layout/MainLayoutAutenticadoSemScroll'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'

export default function ClientePagamentoCartaoScreen() {
  const { navigate } = useNavigate()
  const [cvc, setCvc] = useState('')
  const [data, setData] = useState('')
  const [nome, setNome] = useState('')
  const nomeTruncado = truncateString(nome, 15)
  const [cpfTitular, setcpfTitular] = useState('')
  const [numeroCartao, setNumeroCartao] = useState('')
  const { dadosPagamento, setDadosPagamento } = useDadosPagamento()

  const handleNumeroCartao = (value: any) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")
    // Aplica a máscara para o número do cartão de crédito
    const maskedValue = numericValue.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4")
    setNumeroCartao(maskedValue);
  }

  const handleDataMask = (value: any) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")
    // Aplica a máscara para o mês e o ano
    const maskedValue = numericValue.replace(/(\d{2})(\d{2})/, "$1/$2")
    setData(maskedValue);
  }

  const handleCPFMask = (value: any) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")
    // Verifica se é CPF ou CNPJ
    const isCpf = numericValue.length <= 11
    // Aplica a máscara para CPF ou CNPJ
    const maskedValue = isCpf
      ? numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    setcpfTitular(maskedValue)
  }

  const handleSubmit = () => {
    if (numeroCartao.length <= 15) {
      Toast.show({
        type: 'error',
        text1: 'Informe um número de cartão válido',
      })
      return;
    }
    if (cvc.length <= 2) {
      Toast.show({
        type: 'error',
        text1: 'Informe um código de cartão válido',
      })
      return;
    }
    if (data.length <= 4) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma data de válidade válida',
      })
      return;
    }
    if (nome.length <= 4) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma nome válido',
      })
      return;
    }
    if (cpfTitular.length <= 12) {
      Toast.show({
        type: 'error',
        text1: 'CPF incompleto',
      })
      return;
    }

    setDadosPagamento({
      ...dadosPagamento,
      numero_cartao: numeroCartao,
      codigo_cvc: cvc,
      cpf_titular: cpfTitular,
      data_validade: data,
      nome_pessoa: nome,
    })
    navigate('ClientePagamentoEndereco')
  }

  function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.slice(0, maxLength) + '...';
    }
  }

  async function getUser() {
    try {
      const response = await AsyncStorage.getItem('dados-perfil')
      if (response !== null) {
        const data = JSON.parse(response)
        handleCPFMask(data.cpf_represetante)
      }
    } catch (error: any) {
      console.error("Pagamento Cartão - Dados usuário:", error);
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  return (
    <MainLayoutAutenticadoSemScroll marginTop={0} marginHorizontal={0}>
      <HeaderPrimary voltarScreen={() => navigate('ClienteTipoPagamentoScreen')} titulo='Realizar pagamento' />
      <ScrollView>
        <View className='mx-7 mt-5 justify-between' >
          <H5>Preencha com os dados do seu cartão de crédito</H5>
          <Caption>
            Nossa maior preocupação é a segurança dos seus dados. Este ambiente é totalmente seguro.
          </Caption>

          <View className='relative '>
            <Image className='mx-auto mt-4' source={require('../../../../../../assets/img/cliente/cartao-dafault.png')} />
            <View className='absolute mx-auto max-[220px] z-50 px-2 pt-2'>

              <Text className='text-[16px] text-white top-[60px] left-16 font-bold'>{numeroCartao}</Text>
              <Text className='text-[12px] text-white top-[63px] left-16'>Nome</Text>
              <Text className='text-[12px] text-white top-[63px] left-16 font-bold'>{nomeTruncado}</Text>
              <Text className='text-[12px] text-white top-8 left-[230px]'>Validade</Text>
              <Text className='text-[12px] text-white top-8 left-[230px] font-bold'>{data}</Text>
              <Text className='text-[10px] text-white top-9 left-16'>CVC</Text>
              <Text className='text-[12px] text-white top-9 left-16 font-bold'>{cvc}</Text>
            </View>

          </View>
          <View className='mt-4 mb-6'>
            <InputOutlined
              maxLength={19}
              value={numeroCartao}
              label='Número do cartão'
              keyboardType='number-pad'
              onChange={handleNumeroCartao}
            />
            <InputOutlined
              mt={8}
              label='CVC'
              maxLength={3}
              onChange={setCvc}
              keyboardType='number-pad'
            />
            <InputOutlined
              mt={8}
              value={data}
              maxLength={5}
              keyboardType='number-pad'
              label='Data de validade (MM/AA)'
              onChange={handleDataMask}
            />
            <InputOutlined
              mt={8}
              keyboardType='default'
              onChange={setNome}
              label='Nome no cartão'
            />
            <InputOutlined
              mt={8}
              maxLength={18}
              value={cpfTitular}
              keyboardType='number-pad'
              label='CPF/CNPJ do titular do cartão'
              onChange={handleCPFMask}
            />
          </View>
          <FilledButton
            title='Continuar'
            disabled={cvc.length <= 0 || nome.length <= 0 || numeroCartao.length <= 0 || data.length <= 0 || cpfTitular.length < 9 ? true : false}
            onPress={handleSubmit}
          />
        </View>
        <View className='w-full h-[440px]' />
      </ScrollView>
    </MainLayoutAutenticadoSemScroll>
  );
}

const Styles = StyleSheet.create({
  front: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});