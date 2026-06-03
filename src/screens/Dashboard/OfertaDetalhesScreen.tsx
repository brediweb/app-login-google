import { View } from 'react-native'
import { api } from '../../service/api'
import QRCode from 'react-native-qrcode-svg'
import LottieView from 'lottie-react-native'
import { colors } from '../../styles/colors'
import H3 from '../../components/typography/H3'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import Caption from '../../components/typography/Caption'
import Paragrafo from '../../components/typography/Paragrafo'
import ModalTemplate from '../../components/Modals/ModalTemplate'
import HeaderPrimary from '../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import ButtonOutline from '@components/buttons/ButtonOutline'

function resolverIdOferta(cupom: any) {
  return cupom?.idOferta ?? cupom?.id_oferta ?? cupom?.oferta_id ?? cupom?.id
}

export default function OfertaDetalhesScreen(props: any) {
  const isFocused = useIsFocused()
  const { navigate, goBack } = useNavigate()
  const cupomParam = props.route?.params?.cupom
  const ofertaIdRoute = resolverIdOferta(cupomParam)
  const [idOferta, setIdOferta] = useState('')
  const [loading, setLoading] = useState(true)
  const [dadosUser, setDadosUser] = useState<any>(null)
  const [propsOferta, setPropsOferta] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState(false)

  const carregarDetalhes = useCallback(async () => {
    setLoading(true)
    setMensagemSucesso(false)
    setModalVisible(false)
    setPropsOferta([])

    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')

      if (!jsonValue || !ofertaIdRoute) {
        return
      }

      const newJson = JSON.parse(jsonValue)
      setDadosUser(newJson)

      const headers = {
        Authorization: `Bearer ${newJson.token}`,
      }
      const response = await api.get(`/cupons/${ofertaIdRoute}`, { headers })
      const results = response.data.results
      const lista = Array.isArray(results) ? results : results ? [results] : []

      if (lista.length > 0) {
        setPropsOferta(lista)
        setIdOferta(String(lista[0].id ?? ofertaIdRoute))
      }
    } catch (error: any) {
      console.log('ERROR GET Detalhe Oferta:', error?.response?.data ?? error)
    } finally {
      setLoading(false)
    }
  }, [ofertaIdRoute])

  useEffect(() => {
    if (isFocused) {
      void carregarDetalhes()
    }
  }, [isFocused, carregarDetalhes])

  useEffect(() => {
    if (!isFocused || !idOferta || mensagemSucesso) {
      return
    }

    let ativo = true

    async function verificarCupom() {
      try {
        const jsonValue = await AsyncStorage.getItem('infos-user')
        if (!jsonValue || !ativo) return

        const newJson = JSON.parse(jsonValue)
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/meus-cupoms/verificar?idOferta=${idOferta}`, { headers })

        if (response.data.results.verificado && ativo) {
          setMensagemSucesso(true)
          setModalVisible(true)
        }
      } catch (error: any) {
        console.error('Error GET Verificar:', error?.response?.data)
      }
    }

    void verificarCupom()
    const intervalId = setInterval(verificarCupom, 5000)

    return () => {
      ativo = false
      clearInterval(intervalId)
    }
  }, [isFocused, idOferta, mensagemSucesso])

  const handleCloseModal = () => {
    setModalVisible(false)
    goBack()
  }

  const handleCloseModalSucesso = () => {
    setModalVisible(false)
    navigate('AvaliacaoScreen', {
      id_anunciante: cupomParam?.cliente_id,
      id_oferta: ofertaIdRoute,
    })
  }

  const handleCloseModalVoltar = () => {
    setModalVisible(false)
  }

  const oferta = propsOferta[0]

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
        {!loading && oferta && dadosUser &&
          <View className='flex-1'>
            <View className='mr-4'>
              <HeaderPrimary titulo={`Detalhes: ${oferta.titulo_oferta}`} voltarScreen={() => navigate('Meus Cupons')} />
            </View>
            <View className='flex-1 h-full w-full justify-center items-center mt-12'>
              {!mensagemSucesso &&
                <LottieView style={{ width: 120, height: 120 }} source={require('../../animations/buscando.json')} autoPlay loop />
              }
              <View className='mx-4 my-4'>
                <Paragrafo align={'center'} title='Utilize o QR CODE abaixo para validar no estabelecimento (caixa)' />
                <View className='mx-auto my-6'>
                  <QRCode
                    size={140}
                    logoSize={30}
                    value={`${oferta.codigo_cupom}-${dadosUser.id}`}
                    logoBackgroundColor='transparent'
                  />
                </View>
                <Caption align={'center'} fontSize={12} margintop={12}>
                  CÓDIGO AUXILIAR
                </Caption>
                <Caption margintop={8} align={'center'} fontSize={16} fontWeight={'bold'}>
                  {oferta.codigo_cupom}
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
        }
        {!loading && !oferta &&
          <View className='mx-7 mt-12'>
            <H3 align='center'>Não foi possível carregar os detalhes do cupom.</H3>
          </View>
        }
      </MainLayoutAutenticado>
    </>
  )
}
