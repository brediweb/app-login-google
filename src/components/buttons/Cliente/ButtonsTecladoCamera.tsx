import { useState } from 'react'
import Loading from '../../Loading'
import H3 from '../../typography/H3'
import FilledButton from '../FilledButton'
import { api } from '../../../service/api'
import IcoFlash from '../../../svg/IcoFlash'
import Caption from '../../typography/Caption'
import { colors } from '../../../styles/colors'
import IcoCamera from '../../../svg/IcoCamera'
import Toast from 'react-native-toast-message'
import IcoFlashNot from '../../../svg/IcoFlashNot'
import InputOutlined from '../../forms/InputOutlined'
import ModalTemplate from '../../Modals/ModalTemplate'
import IcoCloseWhite from '../../../svg/IcoCloseWhite'
import { useNavigate } from '../../../hooks/useNavigate'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Camera, useCameraDevices, CameraPosition } from 'react-native-vision-camera'
import { Dimensions, Image, Modal, TouchableOpacity, View, Text, Keyboard, PermissionsAndroid, Alert, ScrollView } from 'react-native'
import React from 'react'

export default function ButtonsTecladoCamera() {
  const { navigate, goBack } = useNavigate()
  const devices = useCameraDevices() as any
  const [codigo, setCodigo] = useState('')
  const [flashOn, setFlashOn] = useState(false)
  const [loading, setLoading] = useState(false)
  const { width: larguraTela, height: alturaTela } = Dimensions.get('window')
  const [exibiCodigo, setExibiCodigo] = useState('')
  const [codigoCliente, setCodigoCliente] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [envioSucesso, setEnvioSucesso] = useState(false)
  const [cameraVisible, setCameraVisible] = useState(false)
  const [cameraPostion, setCameraPosition] = useState<CameraPosition>('back')
  const device = cameraPostion === 'front' ? devices.front : devices.back

  // if (device == null) return <Loading />


  const handleCamera = () => {
    setCameraVisible(true)
  }

  const handleCloseCamera = () => {
    setCameraVisible(false)
  }

  async function onSubmit() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)

      const formdata = {
        cliente_id: codigoCliente,
        codigo: codigo.toLocaleUpperCase()
      }
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.post(`/valida-codigo`, formdata, { headers })
        setEnvioSucesso(true)
        setExibiCodigo(codigo)
        setCodigo('')
        setCodigoCliente('')
      } catch (error: any) {
        console.error(error.response.data)
        Alert.alert('Erro', error.response.data.message ?? 'Revise o código e tente novamente!')
      }
    }
    setLoading(false)
  }

  function closeModal() {
    setCodigo('')
    setCodigoCliente('')
    setModalVisible(false)
    setEnvioSucesso(false)
  }

  function voltaModal() {
    setCodigo('')
    setCodigoCliente('')
    setModalVisible(true)
    setEnvioSucesso(false)
  }

  const handleButtonClick = () => {
    Keyboard.dismiss()
  }

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        handleCamera()
      } else {
        Toast.show({
          type: 'error',
          text1: 'Precisa conceder permissão para usar a câmera!',
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }

  function handleCameraPostion() {
    setCameraPosition(prevState => prevState == 'front' ? 'back' : 'front')
  }

  const handleFlash = () => {
    if (cameraPostion === 'front') {
      return Alert.alert('Flash', 'Utilize a câmera traseira para ativar o flash!')
    }
    setFlashOn(!flashOn)
  }

  return (
    <>
      <View
        className='bg-white w-full absolute bottom-0 pb-4 pt-4 items-center justify-center'
        style={[
          { zIndex: 9999 },
          larguraTela >= 360 ? { flexDirection: 'row', gap: 16 } : { flexDirection: 'column', gap: 12 }
        ]}
      >
        <Modal visible={modalVisible} animationType='slide' transparent statusBarTranslucent>
          {loading && <Loading />}
          <View
            style={{
              flex: 1,
              width: larguraTela,
              height: alturaTela,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ScrollView
              style={{ width: '100%', flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 48,
                paddingHorizontal: 24,
                paddingBottom: 120,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                className='relative rounded-lg px-6 py-8 items-center'
                style={{ width: '100%', maxWidth: 400 }}
              >
                {envioSucesso ? (
                  <View className='items-center w-full'>
                    <H3 align='center'>Código <Text className='font-bold'>{exibiCodigo}</Text> validado com sucesso!</H3>
                    <View className='my-6'>
                      <Image source={require('../../../../assets/img/cliente/coidog-auxiliar.png')} />
                    </View>
                    <View className='w-full mt-2'>
                      <FilledButton title='Validar outro código' onPress={voltaModal} />
                    </View>
                  </View>
                ) : (
                  <View className='w-full'>
                    <View className='mb-6'><H3 align='center'>Informe as informações necessárias:</H3></View>
                    <InputOutlined
                      onChange={setCodigo}
                      label='Código: '
                      value={codigo}
                      maxLength={10}
                      keyboardType='default'
                    />
                    <View className='w-full h-4' />
                    <InputOutlined
                      onChange={setCodigoCliente}
                      label='Código do Cliente: '
                      value={codigoCliente}
                      maxLength={10}
                      keyboardType='number-pad'
                    />
                    <View className='mt-8'>
                      <FilledButton
                        disabled={codigo.length <= 0}
                        title='Validar Código'
                        onPress={() => onSubmit()}
                      />
                    </View>
                  </View>
                )}

                <View className='w-full mt-6'>
                  <FilledButton
                    title='Fechar'
                    backgroundColor='transparent'
                    color={colors.secondary50}
                    border
                    onPress={closeModal}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
        <ModalTemplate
          closeSecondary={true}
          onClose={handleCloseCamera}
          backgroundColor={'transparent'}
          visible={cameraVisible}
          width={'100%'}
          padding={0}
          backgroundColorSecondary={'transparent'}
        >
          <View className='h-full w-full'>
            <Camera
              style={{ flex: 1 }}
              device={device}
              isActive={true}
              torch={flashOn ? 'on' : 'off'}
            />
            <View className='flex-1 flex-row w-full absolute bottom-6 z-50 justify-center items-center'>
              <View className='flex-row items-center bg-[#C9BFFF] rounded-full px-8 py-2'>
                <TouchableOpacity onPress={handleCloseCamera} className='bg-[#6750A4] items-center justify-center rounded-full h-12 w-12 mr-3'>
                  <IcoCloseWhite />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFlash} className='bg-[#77009A] items-center justify-center rounded-full h-12 w-12 mr-3'>
                  {flashOn ?
                    <IcoFlashNot />
                    :
                    <IcoFlash />
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCameraPostion} className='bg-[#77009A] items-center justify-center rounded-full h-12 w-12'>
                  <IcoCamera />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ModalTemplate>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className='rounded-full flex-row items-center py-3 px-5'
          style={{ borderWidth: 1, borderColor: colors.secondary50 }}
        >
          <Image source={require('../../../../assets/img/icons/comprovante.png')} />
          <View className='ml-3'>
            <Caption fontSize={14} fontWeight='500' color={colors.secondary50}>Digitar código</Caption>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate('CameraScreen')}
          className='rounded-full flex-row items-center py-3 px-5'
          style={{ borderWidth: 1, borderColor: colors.secondary50, backgroundColor: colors.secondary50 }}
        >
          <Image source={require('../../../../assets/img/icons/camera.png')} />
          <View className='ml-3'>
            <Caption fontSize={14} fontWeight='500' color={colors.white}>Abrir câmera</Caption>
          </View>
        </TouchableOpacity>
      </View>
    </>
  )
}
