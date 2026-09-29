import { Platform, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import LottieView from 'lottie-react-native'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SplashScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const redirecionou = useRef(false)

  async function getPrimeiroAcesso() {
    if (redirecionou.current) return
    redirecionou.current = true
    try {
      await AsyncStorage.getItem('primeiro-acesso')
      navigate('LoginScreen')
    } catch (error: any) {
      navigate('LoginScreen')
      console.error('Error Primeiro Acesso:', error)
    }
  }

  useEffect(() => {
    if (!isFocused || redirecionou.current) return
    const timeoutDuration = Platform.OS === 'ios' ? 600 : 2000
    const timeoutId = setTimeout(getPrimeiroAcesso, timeoutDuration)
    return () => clearTimeout(timeoutId)
  }, [isFocused])


  return (
    <View className='flex-1 w-full bg-[#775aff]'>
      <LottieView style={{ flex: 1 }} source={require('../../animations/logo-animada.json')} autoPlay />
    </View>
  );
}