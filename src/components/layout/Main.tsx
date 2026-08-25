import H3 from '../typography/H3'
import { api } from '../../service/api'
import Caption from '../typography/Caption'
import { colors } from '../../styles/colors'
import Toast from 'react-native-toast-message'
import FilledButton from '../buttons/FilledButton'
import React, { useEffect, useState } from 'react'
import InputOutlined from '../forms/InputOutlined'
import ModalTemplate from '../Modals/ModalTemplate'
// import ImagePicker from 'react-native-image-crop-picker'
import IcoAlertaSecondary from '../../svg/IcoAlertaSecondary'
import { useGlobal } from '../../context/GlobalContextProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Main({ children }: { children: any }) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagemError, setMensagemError] = useState('')
  const [imagemEnvio, setImagemEnvio] = useState<any>('')
  const [modalFeedback, setModalFeedback] = useState(false)
  const [inputComentario, setInputComentario] = useState('')
  const [imagemSelecionada, setImagemSelecionada] = useState('')
  const { usuarioLogado } = useGlobal()

  async function getToken() {
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')

      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        setToken(newJson.token)
      }
    } catch (error: any) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Ocorreu um erro ao obter o token',
        visibilityTime: 5000,
      })
    }
  }

  async function onSubmit() {
    setMensagemError('')
    setLoading(true)

    try {
      const formdata = new FormData();
      formdata.append('comentario', `${inputComentario}`)

      const novaImage = { uri: imagemEnvio.path ?? '', type: 'image/.png', name: ' ' };
      if (imagemEnvio.path !== undefined) {
        formdata.append('img', novaImage as any);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      const response = await api.post('/feedback', formdata, { headers });

      setModalFeedback(false)
      setImagemSelecionada('')
      setImagemEnvio('')
      setInputComentario('')

      Toast.show({
        type: 'success',
        text1: response.data.message ?? 'Feedback enviado com sucesso!',
        visibilityTime: 5000,
      });
    } catch (error: any) {
      console.error(error)
      if (error.isAxiosError && error.response === undefined) {
        setMensagemError('Erro de rede. Verifique sua conexão e tente novamente.')
      } else {
        setMensagemError(error?.response?.data?.message ?? 'Ocorreu um erro, tente novamente mais tarde')
      }
    }

    setLoading(false)
  }


  function pickSingle({ cropit, circular = false, mediaType }: any) {
    // ImagePicker.openPicker({
    //   cropping: cropit,
    //   cropperCircleOverlay: circular,
    //   sortOrder: 'none',
    //   compressImageMaxWidth: 1000,
    //   compressImageMaxHeight: 1000,
    //   compressImageQuality: 1,
    //   compressVideoPreset: 'MediumQuality',
    //   includeExif: false,
    //   cropperStatusBarColor: '#fff',
    //   cropperToolbarColor: '#fff',
    //   cropperActiveWidgetColor: '#fff',
    //   cropperToolbarWidgetColor: '#3498DB',
    //   mediaType: 'photo',
    // })
    //   .then((image: any) => {
    //     const lastSlashIndex = image.path.lastIndexOf('/')
    //     const imageName = image.path.substring(lastSlashIndex + 1)
    //     setImagemSelecionada(image.path)
    //     setImagemEnvio(image)
    //   })
    //   .catch((error: any) => {
    //     Alert.alert(error.message ? error.message : error)
    //   })
  }

  useEffect(() => {
    getToken()
  }, [])

  return (
    <>
      <ModalTemplate visible={modalFeedback} onClose={() => setModalFeedback(false)}>
        <H3 align={'center'}>Envie seu feedback e avaliação do app</H3>
        {mensagemError &&
          <Caption fontSize={12} fontWeight={'400'} align={'center'} color={colors.error40} >
            {mensagemError}
          </Caption>
        }
        <ScrollView className=" max-h-80 mb-2">
          <InputOutlined
            mt={8}
            required={true}
            label='Comentários'
            keyboardType={'default'}
            onChange={(text: string) => setInputComentario(text)}
          />

          {!imagemSelecionada &&
            <TouchableOpacity onPress={() => pickSingle(false)} className='items-center p-4'>
              <View className='bg-[#F0F0F0] flex items-center justify-center rounded-2xl mb-2 p-3'>
                {/* <Image source={require('./assets/img/icons/camera-gray.png')} /> */}
              </View>

              <Caption fontSize={12} fontWeight={'400'} align={'center'} color={colors.blackdark}>
                Enviar print de ocorrência
              </Caption>
            </TouchableOpacity>
          }

          {imagemSelecionada &&
            <TouchableOpacity onPress={() => pickSingle(false)} className='items-center mt-2 rounded-2xl bg-[#E5DEFF]'>
              <Image resizeMode='contain' source={{ uri: imagemSelecionada }} className='rounded-2xl w-52 h-52' />
            </TouchableOpacity>
          }
        </ScrollView>

        {loading ?
          <FilledButton
            disabled={true}
            title='Carregando...'
            onPress={() => { }}
          />
          :
          <FilledButton
            title='Enviar feedback'
            onPress={onSubmit}
          />
        }

      </ModalTemplate>

      {children}

      {token && usuarioLogado &&
        <TouchableOpacity
          onPress={() => setModalFeedback(true)}
          className='bg-[#E8DEF8] border-2 border-[#775aff] w-12 h-12 shadow-2xl rounded-3xl items-center justify-center absolute bottom-[32px] right-6 z-[10000]'
        >
          <IcoAlertaSecondary />
        </TouchableOpacity>
      }
    </>
  )
}
