import React, { useEffect, useRef, useState } from 'react'
import { Image, KeyboardAvoidingView, Modal, PermissionsAndroid, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { api } from '../../../service/api'
import Loading from '../../../components/Loading'
import H3 from '../../../components/typography/H3'
import FilledButton from '../../../components/buttons/FilledButton'
import IcoClose from '../../../svg/IcoClose'
import IcoCloseWhite from '../../../svg/IcoCloseWhite'
import { useNavigate } from '../../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'

export default function CameraDiscontokenScreen() {
  const isFocused = useIsFocused()
  const { goBack, navigate } = useNavigate()
  const device = useCameraDevice('back')
  const [modo, setModo] = useState<'manual' | 'camera' | null>(null)
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataValue, setDataValue] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalErroVisible, setModalErroVisible] = useState(false)
  const [mensagemErro, setMensagemErro] = useState('')
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
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Acesso à câmera',
          message: 'O app precisa usar a câmera para escanear o QR Code Discontoken.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
        })
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED)
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão da câmera:', err)
      setHasPermission(false)
    }
  }

  useEffect(() => {
    if (!isFocused) return
    setModo(null)
    setHasPermission(null)
    scannedRef.current = false
    setScanned(false)
    setDataValue('')
  }, [isFocused])

  const resetLeitura = () => {
    scannedRef.current = false
    setDataValue('')
    setScanned(false)
  }

  const handleBack = () => {
    if (modo) {
      resetLeitura()
      setModo(null)
      return
    }
    resetLeitura()
    goBack()
  }

  const selecionarCamera = () => {
    setModo('camera')
    askForCameraPermission()
  }

  async function validarDiscontoken() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)      
      const conteudoQr = String(dataValue ?? '')
      const partes = conteudoQr.split(',').map((valor) => valor.trim())

      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        await api.post(`/discotoken/validar`, {
          qr_payload: `${newJson?.id},${partes}`
        }, { headers })
        Toast.show({
          type: 'success',
          text1: 'Discontoken validado com sucesso',
        })
        setModalVisible(true)
      } catch (error: any) {
        console.error('ERROR DISCONTOKEN: ', error?.response?.data ?? error)
        setMensagemErro(error?.response?.data?.message ?? 'Não foi possível validar o Discontoken.')
        setModalErroVisible(true)
      }
    }
    setLoading(false)
  }

  function closeModal() {
    setModalVisible(false)
    resetLeitura()
    navigate('ClienteUtilizadosScreen')
  }

  return (
    <>
      {loading && <Loading />}
      <Modal visible={modalVisible} animationType='slide'>
        <View className='flex-1 items-center justify-center bg-black'>
          <View className='relative rounded-lg bg-white mx-6 px-4 py-24'>
            <View className='my-4'>
              <View className='mx-8 mb-4 items-center'>
                <H3 align={'center'}>Discontoken validado com sucesso!</H3>
                <Image className='mt-4' source={require('../../../../assets/img/cliente/coidog-auxiliar.png')} />
              </View>
              <FilledButton
                border
                title='Voltar'
                color={'#6750A4'}
                onPress={closeModal}
                backgroundColor={'transparent'}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={modalErroVisible} animationType='fade' transparent>
        <View className='flex-1 items-center justify-center bg-black/60 px-6'>
          <View className='w-full rounded-lg bg-white px-4 py-6'>
            <H3 align={'center'}>Erro ao validar Discontoken</H3>
            <Text className='mt-3 text-center text-[#49454F]'>
              {mensagemErro}
            </Text>
            <View className='mt-5'>
              <FilledButton title='Fechar' onPress={() => setModalErroVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {modo === null && (
        <View className='flex-1 bg-white px-6 justify-center'>
          <H3 align='center'>Validar cupom Discontoken</H3>
          <Text className='mt-3 mb-8 text-center text-[#49454F]'>
            Escolha como deseja informar o código do cliente.
          </Text>
          <FilledButton title='Digitar código' onPress={() => setModo('manual')} />
          <View className='h-4' />
          <FilledButton title='Usar câmera' onPress={selecionarCamera} />
          <TouchableOpacity onPress={handleBack} className='mt-6 items-center'>
            <Text className='text-[#6750A4] font-bold'>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {modo === 'manual' && (
        <KeyboardAvoidingView
          className='flex-1 bg-white px-6 justify-center'
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <H3 align='center'>Digitar código Discontoken</H3>
          <Text className='mt-3 text-center text-[#49454F]'>
            Digite o código ID do Usuário.
          </Text>
          <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            value={dataValue}
            keyboardType='numeric'
            onChangeText={setDataValue}
            placeholder='Ex.: 12,345'
            returnKeyType='done'
            className='mt-6 rounded-2xl border border-[#79757F] bg-white px-4 py-3 text-base text-black'
          />
          <View className='mt-5'>
            <FilledButton
              title='Validar Discontoken'
              onPress={validarDiscontoken}
              disabled={!dataValue.trim()}
            />
          </View>
          <TouchableOpacity onPress={handleBack} className='mt-6 items-center'>
            <Text className='text-[#6750A4] font-bold'>Voltar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {modo === 'camera' && (
        <View className='w-full flex-1 bg-black'>
          {hasPermission === null && (
            <View className='flex-1 items-center justify-center bg-white'>
              <Loading />
              <Text>Solicitando permissão da câmera</Text>
            </View>
          )}

          {hasPermission === false && (
            <View className='flex-1 items-center justify-center bg-white px-6'>
              <Text className='text-center mb-4'>Sem acesso à câmera. Permita o acesso para escanear o QR Code Discontoken.</Text>
              <FilledButton title='Permitir acesso' onPress={askForCameraPermission} />
              <TouchableOpacity onPress={handleBack} className='mt-6'>
                <Text className='text-[#6750A4] font-bold'>Voltar</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasPermission && device == null && (
            <View className='flex-1 items-center justify-center bg-white'>
              <Loading />
              <Text className='mt-2'>Carregando câmera...</Text>
            </View>
          )}

          {hasPermission && device != null && (
            <>
              <View className='flex-1 flex-row w-full absolute top-8 left-6 z-50 justify-start items-center'>
                <TouchableOpacity onPress={handleBack} className='bg-[#6750A4] items-center justify-center rounded-full h-12 w-12 mr-3'>
                  <IcoCloseWhite />
                </TouchableOpacity>
              </View>

              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isFocused}
                codeScanner={codeScanner}
              />

              {scanned && (
                <View className='absolute bottom-36 bg-[#E5DEFF] h-24 w-full items-center justify-center px-3'>
                  <TouchableOpacity onPress={resetLeitura} className='absolute right-3 top-2 rounded-full'>
                    <IcoClose />
                  </TouchableOpacity>
                  <Text className='text-center'>QR Code Discontoken encontrado</Text>
                  <Text className='text-center font-bold text-base mt-1'>{dataValue}</Text>
                </View>
              )}

              <View className='flex-1 flex-row w-full absolute bottom-20 z-50 justify-center items-center'>
                <View className='w-[90%]'>
                  <FilledButton title='Validar Discontoken' onPress={validarDiscontoken} disabled={!dataValue} />
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </>
  )
}
