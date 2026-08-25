import { api } from '../../service/api'
import { colors } from '../../styles/colors'
import Toast from 'react-native-toast-message'
import H2 from '../../components/typography/H2'
import DeviceInfo from 'react-native-device-info'
import React, { useEffect, useState } from 'react'
import { OneSignal } from 'react-native-onesignal'
import { useNavigate } from '../../hooks/useNavigate'
import { Linking, Text, TouchableOpacity, View } from 'react-native'
import IcoCelularLogin from '../../svg/IcoCelularLogin'
import Caption from '../../components/typography/Caption'
import MainLayout from '../../components/layout/MainLayout'
import Paragrafo from '../../components/typography/Paragrafo'
import { useGlobal } from '../../context/GlobalContextProvider'
import InputOutlined from '../../components/forms/InputOutlined'
import FilledButton from '../../components/buttons/FilledButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScrollView, Platform } from 'react-native'
import GoogleLoginButton from '@components/buttons/GoogleLoginButton'

export default function LoginClienteScreen() {
  const { navigate } = useNavigate()
  const [email, setEmail] = useState('')
  const versionName = DeviceInfo.getVersion()
  const [subscriptionId, setSubscriptionId] = useState('')
  const [loadign, setLoading] = useState(false)
  const [password, onChangePassword] = useState('')
  const { setTipoUser, setUsuarioLogado } = useGlobal()

  const submitStorageLogin = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('infos-user', jsonValue)
    } catch (error: any) {
      console.error(error)
    }
  }

  const tutorialCheck = async () => {
    try {
      const response = await AsyncStorage.getItem('@tutorial')
      if (response == null) {
        await AsyncStorage.setItem('@tutorial', 'true')
        return navigate('OnBoardingScreen')
      }
      navigate('HomeDrawerNavigation')
    } catch (error) {
      console.error(error)
    }
  }

  async function onSubmit() {
    setLoading(true)
    try {
      const response = await api.post(`/login`, {
        email: email,
        role: "Cliente",
        password: password,
        player_id: subscriptionId,
      })
      OneSignal.User.addEmail(email)

      if (!response.data.error) {
        const storageEmail = await AsyncStorage.setItem('user-email', email)
        const storagePassword = await AsyncStorage.setItem('user-senha', password)
        const storageTipoUser = await AsyncStorage.setItem('tipo-user', 'Cliente')
        submitStorageLogin(response.data.results)
        setTipoUser('Cliente')
        Toast.show({
          type: 'success',
          text1: 'Login realizado com sucesso',
        })
        setUsuarioLogado(true)
        tutorialCheck()
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message ?? 'Ocorreu um erro, tente novamente!',
        })
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response.data.message ?? 'Ocorreu um erro, tente novamente!',
      })
      console.error(error.response.data)
    }
    setLoading(false)
  }

  async function getEmail() {
    setLoading(true)
    try {
      const storageEmail = await AsyncStorage.getItem('user-email')
      if (storageEmail != null) {
        setEmail(storageEmail)
      }
    } catch (error: any) {
      console.error(error)
    }
    setLoading(false)
  }


  useEffect(() => {
    getEmail()
    OneSignal.User.pushSubscription.getIdAsync().then((subscriptionId) => {
      setSubscriptionId(subscriptionId ?? '')
    })
  }, [])

  return (
    <MainLayout carregando={loadign} scroll={true}>
      <ScrollView contentContainerStyle={{ paddingBottom: 220, marginHorizontal: 20 }}>
        <IcoCelularLogin />
        <View className='w-full mb-4'>
          <H2 title='Login' />
          <View className='mb-5 mt-3'>
            <InputOutlined
              onChange={setEmail}
              label='Email'
              value={email}
              keyboardType={'email-address'}
            />
            <InputOutlined
              onChange={onChangePassword}
              label='Senha'
              secureTextEntry={true}
              keyboardType={'default'}
            />
            <View className='flex-row justify-between mt-2 mb-8'>
              <TouchableOpacity onPress={() => navigate('FormPessoaFisicaScreen')}>
                <Paragrafo title='Criar conta' />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigate('RecuperaSenhaScreen')}>
                <Paragrafo title='Esqueceu a senha?' />
              </TouchableOpacity>
            </View>
            <FilledButton
              onPress={onSubmit}
              title='Entrar'
              disabled={email.length <= 0 || password.length <= 0 ? true : false}
            />
            <View className="mt-2"></View>
            <FilledButton
              onPress={() => navigate('LoginScreen')}
              title='Trocar perfil'
              backgroundColor={colors.secondary60}
            />
            {Platform.OS !== 'ios' && (
              <>
                <View className="mt-2"></View>
                <View className="flex-row items-center justify-center my-2">
                  <View className="flex-1 h-px bg-gray-300"></View>
                  <Text className="mx-3 text-gray-600" style={{ fontSize: 14 }}>ou</Text>
                  <View className="flex-1 h-px bg-gray-300"></View>
                </View>
                <GoogleLoginButton
                  onPress={() => Linking.openURL('https://www.backend.discontapp.com.br/api/auth/google?tipo=cliente')}
                  title='Continuar com Google'
                />
              </>
            )}
          </View>
          <View className='absolute bottom-0 right-0'>
            <Caption fontWeight={'bold'}>{versionName ?? ''}</Caption>
          </View>
        </View>
      </ScrollView>
    </MainLayout >
  );
}

