import { useState } from 'react'
import { api } from '../../../service/api'
import Toast from 'react-native-toast-message'
import H5 from '../../../components/typography/H5'
import Caption from '../../../components/typography/Caption'
import FilledButton from '../../../components/buttons/FilledButton'
import InputOutlined from '../../../components/forms/InputOutlined'
import HeaderPrimary from '../../../components/header/HeaderPrimary'
import InputMascaraPaper from '../../../components/forms/InputMascaraPaper'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import MainLayoutAutenticadoSemScroll from '../../../components/layout/MainLayoutAutenticadoSemScroll'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SugerirEstabelecimentosScreen() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorNome, setErrorNome] = useState(false)
  const [perfilFacebook, setPerfilFacebook] = useState('')
  const [perfilInstagram, setPerfilInstagram] = useState('')

  async function onSubmit() {
    setErrorNome(false)

    if (nome.trim().length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'O nome é obrigatório',
      })
      setErrorNome(true)
      return
    }
    if (nome.trim().length <= 3) {
      Toast.show({
        type: 'error',
        text1: 'Digite um nome válido!',
      })
      setErrorNome(true)
      return
    }

    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      const token = jsonValue ? JSON.parse(jsonValue)?.token : null
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Faça login para enviar a sugestão.',
        })
        return
      }

      const response = await api.post(
        `/sugerir-estabelecimento`,
        {
          nome_estabelecimento: nome.trim(),
          telefone: telefone.replace(/\D/g, ''),
          perfil_facebook: perfilFacebook.trim(),
          pefil_facebook: perfilFacebook.trim(),
          perfil_instagram: perfilInstagram.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      if (!response.data.error) {
        Toast.show({
          type: 'success',
          text1: response.data.message ?? 'Dados enviados com sucesso!',
        })
        setNome('')
        setTelefone('')
        setPerfilFacebook('')
        setPerfilInstagram('')
        setErrorNome(false)
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message ?? 'Ocorreu um erro, tente novamente',
        })
      }
    } catch (error: any) {
      console.error(error?.response?.data)
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? error?.response?.data?.erro ?? 'Ocorreu um erro, tente novamente',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3");
    setTelefone(phone);
  }

  return (
    <MainLayoutAutenticadoSemScroll marginTop={0} loadign={loading} marginHorizontal={0}>
      <ScrollView>
        <View className='w-full mt-4' />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <HeaderPrimary titulo='Sugerir estabelecimento' />
          <View className='mx-4 mt-6 pb-20'>
            <H5>Quer indicar algum estabelecimento comercial?</H5>
            <View className='mt-2' />
            <Caption fontSize={14}>Conhece algum estabelecimento que ainda não é parceiro, mas que você gostaria de ver por aqui? É só indicar com os dados abaixo.</Caption>

            <View className='mt-6'>
              <InputOutlined
                error={errorNome}
                keyboardType={''}
                value={nome}
                onChange={setNome}
                label='Nome do estabelecimento'
              />
              <InputMascaraPaper
                mt={8}
                maxLength={15}
                value={telefone}
                keyboardType={'number-pad'}
                label='Telefone (opcional)'
                onChangeText={(text: any) => handlePhoneMask(text)}
              />
              <InputOutlined
                mt={12}
                keyboardType={'default'}
                value={perfilFacebook}
                onChange={setPerfilFacebook}
                label='Perfil do facebook (opcional)'
              />
              <InputOutlined
                mt={12}
                keyboardType={'default'}
                value={perfilInstagram}
                onChange={setPerfilInstagram}
                label='Perfil do intagram (opcional)'
              />
              <View className='mt-8'>
                <FilledButton
                  disabled={nome.length > 0 ? false : true}
                  title='Enviar'
                  onPress={onSubmit}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </MainLayoutAutenticadoSemScroll>
  );
}
