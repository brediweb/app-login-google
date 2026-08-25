import React, { useEffect, useState, useRef } from 'react'
import { api } from '../../../service/api'
import IcoClose from '../../../svg/IcoClose'
import Toast from 'react-native-toast-message'
import Loading from '../../../components/Loading'
import H3 from '../../../components/typography/H3'
import IcoCloseWhite from '../../../svg/IcoCloseWhite'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import FilledButton from '../../../components/buttons/FilledButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ButtonPrimary from '../../../components/buttons/ButtonPrimary'
import { View, Text, TouchableOpacity, Modal, Image, Platform, PermissionsAndroid, StyleSheet } from 'react-native'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'

export default function CameraScreen() {
  const isFocused = useIsFocused()
  const { navigate, goBack } = useNavigate()
  const device = useCameraDevice('back')
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataValue, setDataValue] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannedRef = useRef(false)

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !scannedRef.current) {
        scannedRef.current = true
        setDataValue(codes[0].value)
        setScanned(true)
      }
    },
  })

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission()
  }, [])

  useEffect(() => {
    scannedRef.current = false
    setScanned(false)
    askForCameraPermission()
  }, [isFocused])

  const handleStatusCodigo = () => {
    scannedRef.current = false
    setDataValue('')
    setScanned(false)
  }

  const handleBackCamera = () => {
    scannedRef.current = false
    setScanned(false)
    setDataValue('')
    goBack()
  }

  // Ask for permission to use the cam
  const askForCameraPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.CAMERA)
        if (status === RESULTS.GRANTED) {
          setHasPermission(true)
          return
        }
        const requestStatus = await request(PERMISSIONS.IOS.CAMERA)
        setHasPermission(requestStatus === RESULTS.GRANTED)
      } else {
        const hasCameraPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
        if (hasCameraPermission) {
          setHasPermission(true)
          return
        }
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Acesso à câmera',
            message: 'O app precisa usar a câmera para escanear códigos.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Negar',
          },
        )
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED)
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão da câmera:', err)
      setHasPermission(false)
    }
  }

  async function onSubmit() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)

      // Filtro id
      const coidgoBruto: string = dataValue
      const partes: string[] = coidgoBruto.split("-")

      const formdata = {
        cliente_id: partes[1],
        codigo: partes[0]
      }
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.post(`/valida-codigo`, formdata, { headers })
        Toast.show({
          type: 'success',
          text1: 'Cupom consumido com suceeso',
        })
        setModalVisible(true)
      } catch (error: any) {
        console.error(error.response.data)
        Toast.show({
          type: 'error',
          text1: error.response.data.message ?? 'Ocorreu um erro, tente novamente!',
        })
      }
    }
    setLoading(false)
  }

  function closeModal() {
    setModalVisible(false)
    navigate('ClienteUtilizadosScreen')
    setDataValue('')
  }

  //check permission and return the screens
  if (hasPermission === null) {
    return <View className='flex-1 items-center justify-center'>
      <Loading />
      <Text>Solicitando permissão da câmera</Text>
    </View>
  }
  if (hasPermission === false) {
    return (
      <View className='flex-1 items-center justify-center px-6'>
        <Text className='text-center mb-4'>Sem acesso à câmera. Permita o acesso para escanear códigos.</Text>
        <ButtonPrimary handler={() => askForCameraPermission()}>Permitir Acesso</ButtonPrimary>
      </View>
    )
  }

  if (device == null && hasPermission) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Loading />
        <Text className='mt-2'>Carregando câmera...</Text>
      </View>
    )
  }

  return (
    <>
      {loading && <Loading />}
      <Modal visible={modalVisible} animationType='slide'>
        <View className='flex-1 items-center justify-center bg-black'>
          <View className='relative rounded-lg bg-white mx-6 px-4 py-24'>
            <View className='my-4'>
              <View className='mx-8 mb-4 items-center'>
                <H3 align={'center'}>Código validado com sucesso!</H3>
                <Image className='mt-4' source={require('../../../../assets/img/cliente/coidog-auxiliar.png')} />
              </View>
              <FilledButton
                border
                title='Voltar'
                color={'#6750A4'}
                onPress={() => closeModal()}
                backgroundColor={'transparent'}
              />
            </View>
          </View>
        </View>
      </Modal >
      <View className='w-full flex-1 bg-black'>
        <View className='flex-1 flex-row w-full absolute top-8 left-6 z-50 justify-start items-center'>
          <View className='flex-row items-center'>
            <TouchableOpacity onPress={handleBackCamera} className='bg-[#6750A4] items-center justify-center rounded-full h-12 w-12 mr-3'>
              <IcoCloseWhite />
            </TouchableOpacity>
          </View>
        </View>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device!}
          isActive={isFocused}
          codeScanner={codeScanner}
        />
        {scanned &&
          <View className='absolute bottom-36 bg-[#E5DEFF] h-20 w-full items-center justify-center'>
            <TouchableOpacity onPress={handleStatusCodigo} className='absolute right-3 top-2 rounded-full'>
              <IcoClose />
            </TouchableOpacity>
            <View className='relative'>
              <Text className='text-center'>
                {`Código encontrado e código do cliente`}
              </Text>
              <Text className='text-center font-bold text-lg'>
                {`${dataValue}`}
              </Text>
            </View>
          </View>
        }

        <View className='flex-1 flex-row w-full absolute bottom-20 z-50 justify-center items-center'>
          <View className='flex-row items-center'>
            <View className='w-48'>
              <FilledButton
                title='Continuar'
                onPress={onSubmit}
                disabled={dataValue ? false : true}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
