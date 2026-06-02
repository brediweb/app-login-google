import { View } from 'react-native'
import { api } from '../../service/api'
import QRCode from 'react-native-qrcode-svg'
import LottieView from 'lottie-react-native'
import { colors } from '../../styles/colors'
import H3 from '../../components/typography/H3'
import React, { useEffect, useState } from 'react'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import Caption from '../../components/typography/Caption'
import Paragrafo from '../../components/typography/Paragrafo'
import ModalTemplate from '../../components/Modals/ModalTemplate'
import HeaderPrimary from '../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import ButtonOutline from '@components/buttons/ButtonOutline'
import Spacing from '@components/layout/Spacing'

export default function OfertaDetalhesScreen(props: any) {
  const isFocused = useIsFocused()
  const { navigate, goBack } = useNavigate()
  const [idOferta, setIdOferta] = useState('')
  const [loading, setLoading] = useState(false)
  const [dadosUser, setDadosUser] = useState<any>([])
  const [propsOferta, setPropsOferta] = useState<any>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState(false)

  const getData = async () => {
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        setDadosUser(newJson)

      }
    } catch (error: any) {
      console.error(error)
    }
    setLoading(false)
  }

  async function getDetalhe() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      setDadosUser(newJson)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/cupons/${props.route.params.cupom.idOferta}`, {
          headers: headers
        })
        setPropsOferta(response.data.results)
        setIdOferta(response.data.results[0].id)

      } catch (error: any) {
        console.log(error.response.data)
      }
    }
  }

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('infos-user')
        if (jsonValue) {
          const newJson = JSON.parse(jsonValue)
          setDadosUser(newJson)
          const headers = {
            Authorization: `Bearer ${newJson.token}`,
          }
          const response = await api.get(`/meus-cupoms/verificar?idOferta=${propsOferta ? propsOferta[0].id : idOferta}`, { headers })
          if (response.data.results.verificado) {
            clearInterval(intervalId)
            setMensagemSucesso(true)
            setModalVisible(true)
          }
        }
      } catch (error: any) {
        console.error('Error GET Verificar:', error.response.data);
      }
    }, 5000); // 5000 milliseconds = 5 seconds


    return () => {
      // Certifique-se de limpar o intervalo quando o componente é desmontado
      clearInterval(intervalId);
    };
  }, [isFocused])

  const handleCloseModal = () => {
    setModalVisible(false)
    goBack()
  }

  const handleCloseModalSucesso = () => {
    setModalVisible(false)
    navigate('AvaliacaoScreen', { id_anunciante: props.route.params.cupom.cliente_id, id_oferta: props.route.params.cupom.idOferta })
  }

  const handleCloseModalVoltar = () => {
    setModalVisible(false)
  }

  useEffect(() => {
    if (isFocused) {
      setMensagemSucesso(false)
      setModalVisible(false)
      getData()
      getDetalhe()
    }
  }, [isFocused])

  useEffect(() => {
    setMensagemSucesso(false)
    setModalVisible(false)
    getData()
    getDetalhe()
  }, [])

  

  return (
    <>
      <ModalTemplate visible={modalVisible} onClose={handleCloseModal} width={'90%'}>
        <View className='w-full justify-center items-center h-96'>
          <LottieView style={{ width: 120, height: 120 }} source={require('../../animations/cupom-validado.json')} autoPlay loop />
          <H3 color={colors.secondary70} align={'center'}>Cupom validado com sucesso !!!</H3>
          <View className='w-56 mt-6'>
            <ButtonOutline title='Avaliar Anunciante' onPress={handleCloseModalSucesso} />
            <View className='w-full h-4' />
            <ButtonOutline
              title='Voltar'
              backgroundColor={'transparent'}
              border
              color={colors.secondary}
              onPress={handleCloseModalVoltar}
            />
          </View>
        </View>
      </ModalTemplate>
      <MainLayoutAutenticado marginHorizontal={0} marginTop={0} loading={loading}>
        <View className='w-full h-[4%] ' />
        {propsOferta && propsOferta.slice(0, 1).map((item: any) => (
          <View className='flex-1' key={item}>
            <View className='mr-4'>
              <HeaderPrimary titulo={`Detalhes: ${item.titulo_oferta}`} voltarScreen={() => navigate('Meus Cupons')} />
            </View>
            <View key={item.id} className='flex-1 h-full w-full justify-center items-center mt-12'>
              {mensagemSucesso === false &&
                <LottieView style={{ width: 120, height: 120 }} source={require('../../animations/buscando.json')} autoPlay loop />
              }
              <View className='mx-4 my-4'>
                <Paragrafo align={'center'} title='Utilize o QR CODE abaixo para validar no estabelecimento (caixa)' />
                <View className='mx-auto my-6'>
                  <QRCode
                    size={140}
                    logoSize={30}
                    value={`${item.codigo_cupom}-${dadosUser.id}`}
                    logoBackgroundColor='transparent'
                  />
                </View>
                <Caption align={'center'} fontSize={12} margintop={12}>
                  CÓDIGO AUXILIAR
                </Caption>
                <Caption margintop={8} align={'center'} fontSize={16} fontWeight={'bold'}>
                  {item.codigo_cupom}
                </Caption>
                <Caption align={'center'} fontSize={12}>
                  CÓDIGO CLIENTE
                </Caption>
                <Caption margintop={8} align={'center'} fontSize={16} fontWeight={'bold'}>
                  {dadosUser.id}
                </Caption>
              </View>
            </View>
          </View>
        ))}
      </MainLayoutAutenticado>
    </>
  );
}
