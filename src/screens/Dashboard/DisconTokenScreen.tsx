import { Linking, Text } from 'react-native'
import { api } from '../../service/api'
import { colors } from '../../styles/colors'
import H1 from '../../components/typography/H1'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, KeyboardAvoidingView, Platform, Image } from 'react-native'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import FilledButton from '../../components/buttons/FilledButton'
import { TouchableOpacity } from 'react-native'
import { useNavigate } from '../../hooks/useNavigate'
import QRCode from 'react-native-qrcode-svg'
import { SvgXml } from 'react-native-svg'

interface Carteirinha {
  codigo?: string
  user_name?: string
  codigo_cliente?: string | number
  associacao_nome?: string
  associacao_logo?: string
  codigo_associacao?: string | number
  associacao_id?: string | number
  qr_code?: string
}

export default function DisconTokenScreen() {
  const isFocused = useIsFocused()
  const [loading, setLoadig] = useState(true)
  const [associado, setAssociado] = useState(false)
  const [carteirinha, setCarteirinha] = useState<Carteirinha | null>(null)

  const { goBack } = useNavigate();

  const getCarteirinha = async () => {
    setLoadig(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      const headers = {
        Authorization: `Bearer ${newJson.token}`,
      }
      console.log(headers);
      try {
        const response = await api.get(`/carteirinha-discotoken`, { headers })
        setCarteirinha(response.data.results)
        setAssociado(true)
      } catch (error: any) {
        setCarteirinha(null)
        setAssociado(false)
        console.error('GET Erro Perfil(DisconToken):', error?.response?.data ?? error)
      }
    } else {
      setCarteirinha(null)
      setAssociado(false)
    }
    setLoadig(false)
  }

  useEffect(() => {
    if (!isFocused) return
    getCarteirinha()
  }, [isFocused])

  return (
    <MainLayoutAutenticado loading={loading}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 100 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {carteirinha &&
          <View className='mb-4 border rounded-2xl pb-6 mt-20'>
            <View className='rounded-t-2xl'>
              <View className='flex flex-row items-center justify-between border-b p-6'>
                <Text className='text-lg' style={{ fontFamily: 'Poppins_400Regular' }}>Discontoken</Text>
                <TouchableOpacity onPress={() => goBack()}>
                  <Image source={require('../../../assets/img/closeButton.png')} className='w-4 h-4' resizeMode='contain' />
                </TouchableOpacity>
              </View>
              <View className='flex flex-row items-center justify-between p-6'>
                <Image source={carteirinha?.associacao_logo ? { uri: carteirinha?.associacao_logo } : require('../../../assets/img/disconIcon.png')} className='w-16 h-16' resizeMode='contain' />
                <View>
                  <Text className='text-xl'>{carteirinha?.associacao_nome}</Text>
                  <View className='flex flex-row justify-end gap-2 items-center'>
                    <Text className='text-[#2F009C]' style={{ fontFamily: 'Poppins_500Medium' }}>
                      {carteirinha?.codigo_associacao}
                    </Text>
                    <View className='rounded-xl px-2 py-1 bg-[#BDEFB4]'>
                      <Text className='text-[#1A5D0F]'>Ativo</Text>
                    </View>
                  </View>
                </View>
              </View>
              {(carteirinha?.qr_code || carteirinha?.codigo) && (
                <View className='flex flex-row items-center justify-center'>
                  {carteirinha?.qr_code ? (
                    <QRCode
                    size={180}
                    value={String(carteirinha?.codigo_cliente)}
                    logoBackgroundColor='transparent'
                  />
                  ) : (
                    <QRCode
                      size={180}
                      value={String(carteirinha.codigo)}
                      logoBackgroundColor='transparent'
                    />
                  )}
                </View>
              )}
              <View className='mt-4'>
                <Text className='text-[#A5A5A5] text-center' style={{ fontFamily: 'Poppins_400Regular' }}>
                  Nome do usuário {'\n'}
                  <Text className='text-black text-lg'>{carteirinha?.user_name}</Text>
                </Text>
              </View>
              <View className='mt-4'>
                <Text className='text-[#A5A5A5] text-center' style={{ fontFamily: 'Poppins_400Regular' }}>
                  ID do Usuário {'\n'}
                  <Text className='text-black text-lg'>{carteirinha?.codigo_cliente}</Text>
                </Text>
              </View>
            </View>
          </View>
        }
        {!loading && !associado && (
          <View>
            <H1
              align={"center"}
              color={colors.secondary50}
              title='O Discontoken é uma novidade exclusiva para associações e parceiros do discontapp, em breve estará disponível para qualquer usuário cupom.'
            />
            <View className='h-4'></View>
            <FilledButton title='Quero ser um cliente discontoken' onPress={() => Linking.openURL('https://discontapp.info/')} />
          </View>
        )}
      </KeyboardAvoidingView>
    </MainLayoutAutenticado>
  );
}
