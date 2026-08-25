import { View } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SplashScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()

  async function getPrimeiroAcesso() {
    try {
      const storagePrimeiroAcesso = await AsyncStorage.getItem('primeiro-acesso')
      if (storagePrimeiroAcesso != null && storagePrimeiroAcesso === 'true') {
        navigate('LoginScreen')
      } else {
        navigate('LoginScreen')
      }
    } catch (error: any) {
      navigate('LoginScreen')
      console.error('Error Primeiro Acesso:', error)
    }
  }

  useEffect(() => {
    const timeoutDuration = 2000
    const timeoutId = setTimeout(getPrimeiroAcesso, timeoutDuration)
    return () => clearTimeout(timeoutId)
  }, [isFocused])


  return (
    <View className='flex-1 w-full bg-[#775aff]'>
      <LottieView style={{ flex: 1 }} source={require('../../animations/logo-animada.json')} autoPlay />
    </View>
  );
}