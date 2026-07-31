import { api } from '../../service/api'
import * as Linking from 'expo-linking'
import { colors } from '../../styles/colors'
import Toast from 'react-native-toast-message'
import H2 from '../../components/typography/H2'
import DeviceInfo from 'react-native-device-info'
import React, { useEffect, useState } from 'react'
import { OneSignal } from 'react-native-onesignal'
import { useRoute } from '@react-navigation/native'
import { useNavigate } from '../../hooks/useNavigate'
import IcoCelularLogin from '../../svg/IcoCelularLogin'
import Caption from '../../components/typography/Caption'
import MainLayout from '../../components/layout/MainLayout'
import Paragrafo from '../../components/typography/Paragrafo'
import { useGlobal } from '../../context/GlobalContextProvider'
import FilledButton from '../../components/buttons/FilledButton'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LoadLoginGoogleCliente() {
  const route = useRoute()
  const { navigate } = useNavigate()
  const versionName = DeviceInfo.getVersion()
  const [playerId, setPlayerId] = useState('')
  const [loadign, setLoading] = useState(true)
  const { setTipoUser, setUsuarioLogado } = useGlobal()

  const submitStorageLogin = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('infos-user', jsonValue)
    } catch (error: any) {
      console.error(error)
    }
  }

  async function getInfosUser(token: string) {
    const response = await api.get(`/user-info `,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    submitStorageLogin(
      {
        nome: response.data.results.nome,
        sobrenome: response.data.results.sobrenome,
        tipo_usuario: response.data.results.tipo_usuario,
        email: response.data.results.email,
        id: response.data.results.id,
        token: token,
        cod_status: response.data.results.cod_status,
        mensagem: response.data.results.mensagem,
        associacao_id: response.data.results.associacao_id,
        cep: response.data.results.cep,
        discotoken: response.data.results.discotoken
      }
    )
    tutorialCheck()
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
    setLoading(false)
  }

  async function onSubmit(token: string) {
    const storageEmail = await AsyncStorage.setItem('user-email', '')
    const storagePassword = await AsyncStorage.setItem('user-senha', '')
    const storageTipoUser = await AsyncStorage.setItem('tipo-user', 'Cliente')

    setTipoUser('Cliente')
    Toast.show({
      type: 'success',
      text1: 'Login realizado com sucesso!',
    })
    setUsuarioLogado(true)
    // tutorialCheck()
    getInfosUser(token)
  }


  // Captura o token do deep link quando o app é aberto via URL
  useEffect(() => {
    // Método 1: Via parâmetros da rota (React Navigation)
    const routeParams = route.params as { token?: string } | undefined
    if (routeParams?.token) {
      onSubmit(routeParams.token)
      return
    }

    // Método 2: Via Linking API (para quando o app já está aberto)
    const handleDeepLink = async (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url)
      if (queryParams?.token) {
        onSubmit(queryParams?.token as string)
      }
    }

    // Verifica se há um deep link inicial quando o app abre
    Linking.getInitialURL().then((url) => {
      if (url) {
        const { queryParams } = Linking.parse(url)
        if (queryParams?.token) {
          onSubmit(queryParams.token as string)
        }
      }
    })

    // Escuta deep links quando o app já está aberto
    const subscription = Linking.addEventListener('url', handleDeepLink)

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
        <H2 title='Carregando...' />
        <View className='mb-5 mt-3'>
          <View className='flex-row justify-between mt-2 mb-8'>
            <TouchableOpacity onPress={() => navigate('FormPessoaJuridicaScreen')}>
              <Paragrafo title='Criar conta' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('RecuperaSenhaScreen')}>
              <Paragrafo title='Esqueceu a senha?' />
            </TouchableOpacity>
          </View>
          <FilledButton
            onPress={() => { }}
            title='Entrar'
          />
          <View className="mt-2"></View>
          <FilledButton
            onPress={() => navigate('LoginScreen')}
            title='Trocar perfil'
            backgroundColor={colors.secondary60}
          />
          {/* {Platform.OS !== 'ios' && (
            <>
              <View className="mt-2"></View>
              <FilledButton
                onPress={() => Linking.openURL('https://www.backend.discontapp.com.br/api/auth/google?tipo=anunciante')}
                title='Login Google'
                backgroundColor={colors.primary10}
              />
            </>
          )} */}
        </View>
        <View className='absolute bottom-0 right-0'>
          <Caption fontWeight={'bold'}>{versionName ?? ''}</Caption>
        </View>
      </ScrollView>
    </MainLayout >
  );
}

