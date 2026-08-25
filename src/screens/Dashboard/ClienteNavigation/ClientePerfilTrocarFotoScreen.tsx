import React, { useEffect, useState } from 'react';
import H5 from '../../../components/typography/H5';
import { View, TouchableOpacity, Image, Text, Alert, Platform, PermissionsAndroid } from 'react-native';
import ButtonPerfil from '../../../components/buttons/ButtonPerfil';
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado';
import { useNavigate } from '../../../hooks/useNavigate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../service/api';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { check, request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';

export default function ClientePerfilTrocarFotoScreen() {
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const { goBack, navigate } = useNavigate();
  const [editar, setEditar] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);
  const [imagemEnvio, setImagemEnvio] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [logomarca, setLogomarca] = useState<any>(null);
  const [categoriaPerfil, setCategoriaPerfil] = useState([]);
  const [nomeEmpresarial, setNomeEmpresarial] = useState('');
  const [imagemSelecionada, setImagemSelecionada] =
    useState<any>();

  async function getPerfil() {
    const jsonValue = await AsyncStorage.getItem('infos-user');

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);
      try {
        const response = await api.get(`/perfil/pessoa-juridica/${newJson.id}`);

        setLogomarca(response.data.results.logomarca);
      } catch (error: any) {
        console.error('Error GET Perfil: ', error.response.data);
      }
    }
  }

  function showPermissionDeniedAlert() {
    Alert.alert(
      'Permissão necessária',
      'Para alterar a logomarca é necessário permitir acesso à galeria ou câmera. Deseja abrir as configurações do app?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => openSettings() },
      ],
      { cancelable: false }
    );
  }

  async function requestGalleryPermissionAndOpen() {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          openGallery();
          return;
        }
        const requestStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (requestStatus === RESULTS.GRANTED || requestStatus === RESULTS.LIMITED) {
          openGallery();
        } else {
          showPermissionDeniedAlert();
        }
      } else {
        // Android 13+ (API 33+) usa Photo Picker do sistema (não requer permissão READ_MEDIA_IMAGES)
        // Android < 13 ainda precisa de READ_EXTERNAL_STORAGE
        if ((Platform.Version as number) >= 33) {
          // Android 13+: usar Photo Picker do sistema diretamente (sem solicitar permissão)
          openGallery();
        } else {
          // Android < 13: solicitar READ_EXTERNAL_STORAGE
          const readStorage = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Acesso à galeria',
              message: 'O app precisa acessar suas fotos para alterar a logomarca.',
              buttonPositive: 'Permitir',
              buttonNegative: 'Negar',
            }
          );
          if (readStorage === PermissionsAndroid.RESULTS.GRANTED) {
            openGallery();
          } else {
            showPermissionDeniedAlert();
          }
        }
      }
    } catch (err) {
      console.warn('Erro permissão galeria:', err);
      Toast.show({ type: 'error', text1: 'Não foi possível acessar a galeria.' });
    }
  }

  async function requestCameraPermissionAndOpen() {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.CAMERA);
        if (status === RESULTS.GRANTED) {
          openCamera();
          return;
        }
        const requestStatus = await request(PERMISSIONS.IOS.CAMERA);
        if (requestStatus === RESULTS.GRANTED) {
          openCamera();
        } else if (requestStatus === RESULTS.BLOCKED) {
          showPermissionDeniedAlert();
        } else {
          showPermissionDeniedAlert();
        }
      } else {
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (hasPermission) {
          openCamera();
          return;
        }
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Acesso à câmera',
            message: 'O app precisa usar a câmera para tirar a foto da logomarca.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Negar',
          }
        );
        if (cameraPermission === PermissionsAndroid.RESULTS.GRANTED) {
          openCamera();
        } else {
          showPermissionDeniedAlert();
        }
      }
    } catch (err) {
      console.warn('Erro permissão câmera:', err);
      Toast.show({ type: 'error', text1: 'Não foi possível acessar a câmera.' });
    }
  }

  function openGallery() {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 1,
      mediaType: 'photo',
      cropperToolbarTitle: 'Editar foto',
      cropperChooseText: 'Usar',
      cropperCancelText: 'Cancelar',
    })
      .then((image: any) => {
        setImagemSelecionada(image.path);
        setImagemEnvio(image.path);
        handleAtualizaLogoPerfil(image);
      })
      .catch((error: any) => {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: error?.message ?? 'Erro ao abrir a galeria.' });
        }
      });
  }

  function openCamera() {
    ImagePicker.openCamera({
      width: 500,
      height: 500,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 1,
      mediaType: 'photo',
      cropperToolbarTitle: 'Editar foto',
      cropperChooseText: 'Usar',
      cropperCancelText: 'Cancelar',
    })
      .then((image: any) => {
        setImagemSelecionada(image.path);
        setImagemEnvio(image.path);
        handleAtualizaLogoPerfil(image);
      })
      .catch((error: any) => {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: error?.message ?? 'Erro ao abrir a câmera.' });
        }
      });
  }

  function handlePickImage() {
    Alert.alert(
      'Alterar logomarca',
      'Escolha de onde enviar a imagem',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: requestGalleryPermissionAndOpen },
        { text: 'Câmera', onPress: requestCameraPermissionAndOpen },
      ],
      { cancelable: true }
    );
  }

  async function handleAtualizaLogoPerfil(logo: any) {
    const jsonValue = await AsyncStorage.getItem('infos-user');
    if (jsonValue) {
      const newJsonUsuario = JSON.parse(jsonValue);
      setLoading(true);
      try {
        const headers = {
          Authorization: `Bearer ${newJsonUsuario.token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        };
        const formdata = new FormData();
        formdata.append('logomarca', {
          uri: logo.path,
          type: logo.mime ?? 'image/jpeg',
          name: 'logomarca.jpg',
        } as any);
        const response = await api.post('/atualiza-logomarca', formdata, {
          headers,
        });
        Toast.show({
          type: 'success',
          text1: response.data.message ?? 'Logomarca atualizada!',
        });
        getPerfil();
      } catch (error: any) {
        console.error('Erro ao atualizar logomarca:', error?.response?.data);
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.message ?? 'Erro ao atualizar logomarca!',
        });
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    getPerfil();
  }, []);

  return (
    <MainLayoutAutenticado notScroll marginTop={20} marginHorizontal={16}>
      <View className='w-full mt-4' />
      <ButtonPerfil
        mt={64}
        title="Perfil - Foto / Logomarca"
        fontsize={24}
        onPress={() => navigate('ClientePerfilScreen')}
        image={require('../../../../assets/img/icons/edit.png')}
      />

      <View className="mt-8">
        <Text className="text-base font-semibold text-[#111827] mb-2">
          Sua foto / logomarca
        </Text>
        <Text className="text-sm text-[#6B7280] mb-4">
          Escolha uma imagem nítida e centralizada. Ela será exibida em formato circular no app.
        </Text>

        <TouchableOpacity
          onPress={handlePickImage}
          className="items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-4 py-6"
        >
          {logomarca && !imagemSelecionada && (
            <Image
              source={{ uri: logomarca }}
              className="w-28 h-28 rounded-full mb-4"
            />
          )}

          {imagemSelecionada && (
            <Image
              source={{ uri: imagemSelecionada }}
              className="w-28 h-28 rounded-full mb-4"
            />
          )}

          {!logomarca && !imagemSelecionada && (
            <View className="w-28 h-28 rounded-full bg-[#E5E7EB] mb-4 items-center justify-center">
              <Text className="text-3xl text-[#9CA3AF]">+</Text>
            </View>
          )}

          <Text className="font-semibold text-base text-center text-[#111827]">
            Toque para alterar logomarca
          </Text>
          <Text className="text-xs text-[#6B7280] mt-1 text-center">
            Formato recomendado: quadrado, boa resolução.
          </Text>
        </TouchableOpacity>
      </View>
    </MainLayoutAutenticado>
  );
}
