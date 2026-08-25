import React, { useState } from 'react'
import { api } from '../../service/api'
import H2 from '../../components/typography/H2'
import { useNavigate } from '../../hooks/useNavigate'
import { TouchableOpacity, View } from 'react-native'
import IcoCelularLogin from '../../svg/IcoCelularLogin'
import MainLayout from '../../components/layout/MainLayout'
import Paragrafo from '../../components/typography/Paragrafo'
import InputOutlined from '../../components/forms/InputOutlined'
import FilledButton from '../../components/buttons/FilledButton'
import { Toast } from 'react-native-toast-message/lib/src/Toast'
import { ScrollView } from 'react-native'

export default function RecuperaSenhaScreen() {
  const { goBack } = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    try {
      const response = await api.post(`/recuperar-senha`, {
        email: email
      })
      Toast.show({
        type: 'success',
        visibilityTime: 10000,
        text1: 'E-mail de recuperação de senha enviado!',
      })
      setEmail('')
      goBack()
    } catch (error: any) {
      console.error('ERROR Recuperar Senha: ', error.response.data.message)
      Toast.show({
        type: 'error',
        visibilityTime: 10000,
        text1: error.response.data.message ?? 'Erro, tente novamente mais tarde',
      })
    }
    setLoading(false)
  }

  return (
    <MainLayout carregando={loading} scroll={true}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 320 }}
      >
        <View className='flex-1 h-full px-4'>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <IcoCelularLogin />
            <View className='w-full pb-20'>
              <H2 title='Recuperar senha' />
              <View className='mb-5 mt-3'>
                <InputOutlined
                  onChange={setEmail}
                  label='Email'
                  value={email}
                  keyboardType={'email-address'}
                />
                <View className='items-start mt-2 mb-8'>
                  <TouchableOpacity onPress={() => goBack()}>
                    <Paragrafo title='Voltar para o login' />
                  </TouchableOpacity>
                </View>
                <FilledButton
                  onPress={onSubmit}
                  title='Recuperar senha'
                />
              </View>
            </View>
            <View></View>
          </ScrollView>
        </View>
      </ScrollView>
    </MainLayout >
  );
}

