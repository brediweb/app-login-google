import { View } from 'react-native'
import { api } from '../../../service/api'
import { useEffect, useState } from 'react'
import H5 from '../../../components/typography/H5'
import { useNavigate } from '../../../hooks/useNavigate'
import HeaderPrimary from '../../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import ButtonClienteSwitch from '../../../components/buttons/Cliente/ButtonClienteSwitch'

export default function ClienteListTodosDesativadosScreen({ route }: { route?: any }) {
  const { navigate } = useNavigate()
  const [oferta, setOferta] = useState<any>([])
  const [loading, setLoading] = useState(true)

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
        setOferta(response.data.results)
      } catch (error: any) {
        console.error('ERROR GET Ofertas Inativas: ', error)
      }
    }
    setLoading(false)
  }


  useEffect(() => {
    getCuponsInativos()
  }, [])

  return (
    <>
      <MainLayoutAutenticado marginTop={0} marginHorizontal={0} loading={loading}>
        <HeaderPrimary voltarScreen={() => navigate('ClienteUtilizadosScreen')} titulo='Utilizados' />
        <View className='mx-7 mt-5 min-h-full'>

          <View className=''>
            <H5>Meus anúncios vencidos</H5>
            {oferta && oferta.map((item: any, index: any) => (
              <ButtonClienteSwitch
                key={index}
                disabled={true}
                ocultaSwitch
                onPress={() => { }}
                titulo={item.titulo_oferta}
                subtitulo={item.codigo_cupom}
                image={item.imagem_cupom}
                total={item.quantidade_cupons}
                usados={item.cupoms_disponiveis}
                props={item}
              />
            ))}
          </View>
        </View>
      </MainLayoutAutenticado>
    </>
  );
}
