import { View, Text, TouchableOpacity } from 'react-native'
import { api } from '../../../service/api'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { colors } from '../../../styles/colors'
import H5 from '../../../components/typography/H5'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import Caption from '../../../components/typography/Caption'
import HeaderPrimary from '../../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ButtonOutline from '../../../components/buttons/ButtonOutline'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import ButtonClienteSwitch from '../../../components/buttons/Cliente/ButtonClienteSwitch'
import ButtonsTecladoCamera from '../../../components/buttons/Cliente/ButtonsTecladoCamera'
import { discotokenHabilitaDiscontoken } from '../../../utils/discontokenPerfil'
import React from 'react'

export default function ClienteUtilizadosScreen({ route }: { route?: any }) {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(true)
  const [oferta, setOferta] = useState<any>([])
  const [ofertaInativa, setOfertaInativa] = useState<any>([])
  const [anuncianteDiscontoken, setAnuncianteDiscontoken] = useState(false)


  async function getCuponsGerados() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      setAnuncianteDiscontoken(discotokenHabilitaDiscontoken(newJson.discotoken))
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/meus-cupoms/anunciante`, { headers })
        setOferta(response.data.results)
      } catch (error: any) {
        console.error('Error GET Cupons Gerados: ', error)
      }
    }

    setLoading(false)
  }

  async function getCuponsInativos() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)

      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
          'Content-Type': 'multipart/form-data'
        }
        const response = await api.get(`/meus-cupoms/anunciante/inativo`, { headers })
        setOfertaInativa(response.data.results)
      } catch (error: any) {
        console.error('ERROR GET Ofertas Inativas: ', error)
      }
    }
    setLoading(false)
  }

  async function postStatusCupom(id: any, status: string) {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.put(`/cupons/status-ativo`, {
          idOferta: id,
          ativo: status === '1' ? '0' : '1'
        }, { headers })
        Toast.show({
          type: 'success',
          text1: 'Status atualizado com sucesso',
        })
        getCuponsGerados()
      } catch (error: any) {
        console.error('ERROR Status Oferta: ', error.response.data);

      }
    }
    setLoading(false)
  }

  useEffect(() => {
    getCuponsGerados()
    getCuponsInativos()
  }, [])

  useEffect(() => {
    if (isFocused) {
      getCuponsGerados()
      getCuponsInativos()
    }
  }, [isFocused])

  return (
    <>
      <MainLayoutAutenticado marginTop={0} marginHorizontal={0} loading={loading}>
        <View className='w-full mt-6' />
        <HeaderPrimary titulo='Utilizados' />
        <View className='mx-7 mt-4 min-h-full'>

          <View className=''>
            <H5>Meus anúncios</H5>
            {anuncianteDiscontoken && (
              <View
                className='mt-3 mb-2 rounded-2xl p-3'
                style={{
                  backgroundColor: '#E9DDFF',
                  borderWidth: 1,
                  borderColor: colors.secondary70,
                }}
              >
                <Text
                  className='text-base'
                  style={{ color: colors.secondary50, fontFamily: 'Poppins_600SemiBold' }}
                >
                  Discontoken
                </Text>
                <Caption fontSize={13} margintop={4} color={colors.secondary30}>
                  Use a câmera para validar cupons dos clientes Discontoken.
                </Caption>
                <TouchableOpacity
                  className='mt-3 rounded-full px-4 py-2 self-start'
                  style={{ backgroundColor: colors.secondary50 }}
                  onPress={() => navigate('CameraDiscontokenScreen')}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Poppins_500Medium', fontSize: 13 }}>
                    Validar cupom Discontoken
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {oferta && oferta.slice(0, 3).filter((item: any) => item.quantidade_cupons > 0).map((item: any, index: any) => (
              <ButtonClienteSwitch
                key={index}
                disabled={false}
                onPress={() => postStatusCupom(item.id, item.ativo)}
                titulo={item.titulo_oferta}
                subtitulo={item.codigo_cupom}
                image={item.imagem_cupom}
                total={item.quantidade_cupons}
                usados={item.cupoms_disponiveis}
                props={item}
                status={item.ativo === '1' ? true : false}
              />
            ))}
            {oferta && oferta.filter((item: any) => item.quantidade_cupons >= 1).length <= 0 && (
              <Caption fontSize={16} margintop={4} color={colors.primary30}>Você ainda não possui anúncios ativos.</Caption>
            )}
            {oferta && oferta.filter((item: any) => item.quantidade_cupons >= 1).length > 3 && (
              < View className='mt-3'>
                <ButtonOutline
                  title='Ver todos'
                  onPress={() => navigate('ClienteListTodosAtivosScreen')}
                  color={colors.secondary70}
                  backgroundColor={'transparent'}
                />
              </View>
            )}
          </View>

          <View className='mt-4'>
            <H5>Vencidos</H5>
            {ofertaInativa && ofertaInativa.filter((item: any) => item.quantidade_cupons >= 1).length <= 0 && (
              <Caption fontSize={16} margintop={4} color={colors.primary30}>Você ainda não possui anúncios vencidos.</Caption>
            )}
            {ofertaInativa && ofertaInativa.slice(0, 3).filter((item: any) => item.quantidade_cupons > 0).map((item: any, index: any) => (
              <ButtonClienteSwitch
                key={index}
                disabled={true}
                onPress={() => { }}
                titulo={item.titulo_oferta}
                subtitulo={item.codigo_cupom}
                image={item.imagem_cupom}
                total={item.quantidade_cupons}
                usados={item.cupoms_disponiveis}
                props={item}
              />
            ))}
            {ofertaInativa && ofertaInativa.filter((item: any) => item.quantidade_cupons >= 1).length > 3 && (
              <View className='mt-3'>
                <ButtonOutline
                  title='Ver todos'
                  onPress={() => navigate('ClienteListTodosDesativadosScreen')}
                  color={colors.secondary70}
                  backgroundColor={'transparent'}
                />
              </View>
            )}

          </View>
        </View>
      </MainLayoutAutenticado >
      <ButtonsTecladoCamera />
    </>
  );
}
