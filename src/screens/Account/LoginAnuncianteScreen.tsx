import { api } from '../../service/api'
import { colors } from '../../styles/colors'
import Toast from 'react-native-toast-message'
import H2 from '../../components/typography/H2'
import DeviceInfo from 'react-native-device-info'
import React, { useEffect, useState } from 'react'
import { OneSignal } from 'react-native-onesignal'
import { useNavigate } from '../../hooks/useNavigate'
import IcoCelularLogin from '../../svg/IcoCelularLogin'
import Caption from '../../components/typography/Caption'
import MainLayout from '../../components/layout/MainLayout'
import { ScrollView, TouchableOpacity, View, Text, Platform } from 'react-native'
import Paragrafo from '../../components/typography/Paragrafo'
import { useGlobal } from '../../context/GlobalContextProvider'
import InputOutlined from '../../components/forms/InputOutlined'
import FilledButton from '../../components/buttons/FilledButton'
import GoogleLoginButton from '../../components/buttons/GoogleLoginButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Linking from 'expo-linking'
import { useRoute } from '@react-navigation/native'

export default function LoginAnuncianteScreen() {
  const route = useRoute()
  const { navigate } = useNavigate()
  const [email, setEmail] = useState('')
  const versionName = DeviceInfo.getVersion()
  const [playerId, setPlayerId] = useState('')
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
      const response = await AsyncStorage.getItem('tutorial')
      if (response == null) {
        await AsyncStorage.setItem('tutorial', 'true')
        return navigate('OnBoardingScreen')
      }
      navigate('HomeDrawerNavigation')
    } catch (error) {
      console.error(error)
    }
  }

  async function onSubmit() {
    setLoading(true)
    const formdata = {
      email: email,
      password: password,
      role: "Anunciante",
      player_id: playerId,
    }
    OneSignal.User.addEmail(email)
    try {
      const response = await api.post(`/login`, formdata)

      if (!response.data.error) {
        const storageEmail = await AsyncStorage.setItem('user-email', email)
        const storagePassword = await AsyncStorage.setItem('user-senha', password)
        const storageTipoUser = await AsyncStorage.setItem('tipo-user', 'Anunciante')
        submitStorageLogin(response.data.results)
        setTipoUser('Anunciante')
        Toast.show({
          type: 'success',
          text1: 'Login realizado com sucesso!',
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
        text1: error?.response?.data?.message ?? 'Ocorreu um erro, tente novamente!',
      })
      console.error('ERROR Login: ', error)
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

  // Captura o token do deep link quando o app é aberto via URL
  useEffect(() => {
    // Método 1: Via parâmetros da rota (React Navigation)
    const routeParams = route.params as { token?: string } | undefined
    if (routeParams?.token) {
      return
    }

    // Método 2: Via Linking API (para quando o app já está aberto)
    const handleDeepLink = async (event: { url: string }) => {
      Linking.parse(event.url)
    }

    // Verifica se há um deep link inicial quando o app abre
    Linking.getInitialURL().then((url) => {
      if (url) {
        Linking.parse(url)
      }
    })

    // Escuta deep links quando o app já está aberto
    const subscription = Linking.addEventListener('url', handleDeepLink)

    getEmail()
    OneSignal.User.getOnesignalId().then((id) => {
      setPlayerId(id ?? '')
    })

    return () => {
      subscription.remove()
    }
  }, [route.params])

  return (
    <MainLayout carregando={loadign} scroll={true}>
      <ScrollView contentContainerStyle={{ marginHorizontal: 20, paddingBottom: 500 }}>
        <IcoCelularLogin />
        <H2 title='Login (Anunciante)' />
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
            <TouchableOpacity onPress={() => navigate('FormPessoaJuridicaScreen')}>
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
                onPress={() => Linking.openURL('https://www.backend.discontapp.com.br/api/auth/google?tipo=anunciante')}
                title='Continuar com Google'
              />
            </>
          )}
        </View>
        <View className='absolute bottom-0 right-0'>
          <Caption fontWeight={'bold'}>{versionName ?? ''}</Caption>
        </View>
      </ScrollView>
    </MainLayout >
  );
}

