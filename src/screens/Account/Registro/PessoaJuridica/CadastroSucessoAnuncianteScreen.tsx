import { View } from 'react-native'
import { api } from '../../../../service/api'
import React, { useEffect, useState } from 'react'
import H2 from '../../../../components/typography/H2'
import { useNavigate } from '../../../../hooks/useNavigate'
import IcoMulherSucesso from '../../../../svg/IcoMulherSucesso'
import MainLayout from '../../../../components/layout/MainLayout'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useGlobal } from '../../../../context/GlobalContextProvider'
import FilledButton from '../../../../components/buttons/FilledButton'
import { OneSignal } from 'react-native-onesignal'

export default function CadastroSucessoAnuncianteScreen() {
  const navigation = useNavigate()
  const [loading, setLoading] = useState(false)
  const { senhaUser, setTipoUser } = useGlobal()
  const [emailStorage, setEmailStorage] = useState('')
  const [subscriptionId, setSubscriptionId] = useState('')

  async function getEmail() {
    setLoading(true)
    try {
      const storageEmail = await AsyncStorage.getItem('user-email')
      if (storageEmail !== null && senhaUser !== null) {
        setEmailStorage(storageEmail)
        onSubmit()
      }
    } catch (error: any) {
      console.error('Error Storage: ', error)
    }
    setLoading(false)
  }

  const submitStorageLogin = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('infos-user', jsonValue)
    } catch (error: any) {
      console.error(error)
    }
  }

  async function onSubmit() {
    setLoading(true)

    const formData = {
      email: emailStorage,
      password: senhaUser,
      role: "Anunciante",
      player_id: subscriptionId,
    }

    try {
      const response = await api.post(`/login`, formData)
      if (!response.data.error) {
        const storageEmail = await AsyncStorage.setItem('user-email', emailStorage)
        submitStorageLogin(response.data.results)
        setTipoUser('Anunciante')
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeDrawerNavigation' }],
        })
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        })
      }
    } catch (error: any) {
      console.error('Error Login: ', error)
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
    <MainLayout carregando={loading}>
      <View className='flex-1'>
        <View className='flex-1 justify-center items-center px-4'>
          <IcoMulherSucesso />
          <View className='mt-2'>
            <H2 align={'center'} title='Cadastro realizado com sucesso!' />
          </View>
        </View>
        <View className='w-full px-4 pb-8'>
          <FilledButton onPress={onSubmit} title='Continuar' />
        </View>
      </View>
    </MainLayout>
  );
}



