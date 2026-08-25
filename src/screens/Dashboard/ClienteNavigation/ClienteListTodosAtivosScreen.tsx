import { View } from 'react-native'
import { api } from '../../../service/api'
import { useEffect, useState } from 'react'
import H5 from '../../../components/typography/H5'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import HeaderPrimary from '../../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import ButtonClienteSwitch from '../../../components/buttons/Cliente/ButtonClienteSwitch'
import Toast from 'react-native-toast-message'

export default function ClienteListTodosAtivosScreen({ route }: { route?: any }) {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [oferta, setOferta] = useState<any>([])
  const [loading, setLoading] = useState(true)

  async function getOfertas() {
    setLoading(true)
    const jsonUsuario = await AsyncStorage.getItem('infos-user')

    if (jsonUsuario) {
      const newJson = JSON.parse(jsonUsuario)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`
        }
        const response = await api.get(`/meus-cupoms/anunciante`, {
          headers: headers
        })
        setOferta(response.data.results)
      } catch (error: any) {
        console.error(error)
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
        getOfertas()
      } catch (error: any) {
        console.error('ERROR Status Oferta: ', error.response.data);

      }
    }
    setLoading(false)
  }

  useEffect(() => {
    getOfertas()
  }, [])


  useEffect(() => {
    if (isFocused) {
      getOfertas()
    }
  }, [isFocused])

  return (
    <>
      <MainLayoutAutenticado marginTop={0} marginHorizontal={0} loading={loading}>
        <HeaderPrimary voltarScreen={() => navigate('ClienteUtilizadosScreen')} titulo='Utilizados' />
        <View className='mx-7 mt-5 min-h-full'>

          <View className=''>
            <H5>Meus anúncios ativos</H5>
            {oferta
              .filter((item: any) => item.quantidade_cupons > 0)
              .map((item: any, index: any) => (
                <ButtonClienteSwitch
                  props={item}
                  key={index}
                  disabled={false}
                  onPress={() => postStatusCupom(item.id, item.ativo)}
                  titulo={item.titulo_oferta}
                  subtitulo={item.codigo_cupom}
                  usados={item.quantidade_cupons}
                  total={item.quantidade_cupons}
                  image={item.imagem_cupom}
                  status={item.ativo === '1' ? true : false}
                />
              ))
            }


          </View>

        </View>
      </MainLayoutAutenticado>
    </>
  );
}
