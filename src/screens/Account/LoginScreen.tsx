import { View, TouchableOpacity, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors } from '../../styles/colors';
import H2 from '../../components/typography/H2';
import H5 from '../../components/typography/H5';
import H3 from '../../components/typography/H3';
import DeviceInfo from 'react-native-device-info';
import { useNavigate } from '../../hooks/useNavigate';
import IcoCelularLogin from '../../svg/IcoCelularLogin';
import Caption from '../../components/typography/Caption';
import MainLayout from '../../components/layout/MainLayout';
import { useGlobal } from '../../context/GlobalContextProvider';
import Geolocation from '@react-native-community/geolocation';
import FilledButton from '../../components/buttons/FilledButton';
import ModalTemplate from '../../components/Modals/ModalTemplate';
import { ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestForegroundPermissionsAsync,
} from 'expo-location';
import Toast from 'react-native-toast-message';
import { OneSignal } from 'react-native-onesignal';
import { api } from 'src/service/api';
import Loading from '@components/Loading';

export default function LoginScreen() {
  const { navigate } = useNavigate();
  const [loading, setLoading] = useState(true);
  const { setTipoUser, setUsuarioLogado } = useGlobal();
  const versionName = DeviceInfo.getVersion();
  const [modalVisible, setModalVisible] = useState(false);
  const [regiao, setRegiao] = useState<any>(null);
  const [permissionGrantedIos, setPermissionGrantedIos] = useState(false);

  function onLoginCliente() {
    setModalVisible(false);
    navigate('LoginClienteScreen');
  }

  function onLoginAnunciante() {
    setModalVisible(false);
    navigate('LoginAnuncianteScreen');
  }

  function navigateCliente() {
    setTipoUser('Cliente');
    navigate('SemAuthDrawerNavigation');
  }

  function navigateAnunciante() {
    setTipoUser('Anunciante');
    navigate('SemAuthDrawerNavigation');
  }

  const submitStorageLogin = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('infos-user', jsonValue)
    } catch (error: any) {
      console.error(error)
    }
  }


  async function loginAutoAnunciante(storageEmail: string | null, storagePassword: string | null) {
    const formdata = {
      email: storageEmail,
      password: storagePassword,
      role: "Anunciante",
    }

    if (!storageEmail || !storagePassword) {
      setLoading(false)
      return
    }

    setLoading(true)
    OneSignal.User.addEmail(storageEmail?.toString() ?? '')
    try {
      const response = await api.post(`/login`, formdata)

      if (!response.data.error) {
        submitStorageLogin(response.data.results)
        setTipoUser('Anunciante')
        Toast.show({
          type: 'success',
          text1: 'Login realizado com sucesso!',
        })
        setUsuarioLogado(true)
        navigate('HomeDrawerNavigation')
      }
    } catch (error: any) {
      console.error('ERROR Login auto: ', error)
    }

    setLoading(false)
  }

  async function loginAutoCliente(storageEmail: string | null, storagePassword: string | null) {
    setLoading(true)
    try {
      const response = await api.post(`/login`, {
        email: storageEmail,
        role: "Cliente",
        password: storagePassword,
      })
      OneSignal.User.addEmail(storageEmail?.toString() ?? '')

      if (!response.data.error) {
        submitStorageLogin(response.data.results)
        setTipoUser('Cliente')
        Toast.show({
          type: 'success',
          text1: 'Login realizado com sucesso',
        })
        setUsuarioLogado(true)
        navigate('HomeDrawerNavigation')
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message ?? 'Ocorreu um erro, tente novamente!',
        })
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response.data.message ?? 'Ocorreu um erro, tente novamente!',
      })
      console.error(error.response.data)
    }
    setLoading(false)
  }

  const getInfosUser = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user') as any
      const storageEmail = await AsyncStorage.getItem('user-email')
      const storagePassword = await AsyncStorage.getItem('user-senha')
      const storageTipoUser = await AsyncStorage.getItem('tipo-user')

      if (storageTipoUser && storageTipoUser === 'Anunciante') {
        setTimeout(() => {
          loginAutoAnunciante(storageEmail, storagePassword)
        }, 5000);
        return
      } else if (storageTipoUser && storageTipoUser !== 'Anunciante') {
        setTimeout(() => {
          loginAutoCliente(storageEmail, storagePassword)
        }, 5000);
        return
      } else {
        setLoading(false)
      }

      // if (JSON.parse(jsonValue)) {
      //   setUsuarioLogado(true);
      //   navigate('HomeDrawerNavigation');
      // }
    } catch (error) {
      console.error(error);
    }
  };

  async function getLocalizacao() {
    Geolocation.getCurrentPosition(
      (info) => {
        setRegiao({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        });
      },
      (error) => {
        if (error.code === 3) {
          console.warn('Localização: timeout. Tente em área com melhor sinal.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 15000,
      }
    );
  }

  async function getPermissionIOS() {
    try {
      const { granted } = await requestForegroundPermissionsAsync();
      setPermissionGrantedIos(granted);
    } catch (error: any) {
      console.error('ERRO Permissão IOS:', error);
    }
  }

  useEffect(() => {
    getInfosUser();
    getLocalizacao();
    if (Platform.OS === 'ios') {
      getPermissionIOS();
    }
  }, []);

  return (
    <MainLayout scroll={true}>
      {loading &&
        <Loading />
      }
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ModalTemplate
          width={'90%'}
          visible={modalVisible}
          closeSecondary={true}
          onClose={() => setModalVisible(false)}
        >
          <View className="justify-center items-center mt-4">
            <H3 align={'center'}>Escolha o tipo de login:</H3>
            <View className="w-full mt-4">
              <FilledButton
                title="Usuário anunciante"
                onPress={onLoginAnunciante}
              />
              <View className="h-2"></View>
              <FilledButton title="Usuário cupom" onPress={onLoginCliente} />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-4 w-full"
                style={{
                  borderRadius: 32,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: colors.gray,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: colors.gray, fontWeight: 'bold' }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ModalTemplate>

        <View className="flex-1 px-4">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <IcoCelularLogin />
            <View className="w-full mb-4">
              <H2 title="Login" />
              <H5 color={colors.gray}>Escolha o perfil para login</H5>
              <View className="mb-5 mt-3">
                <View className="mt-2">
                  <FilledButton
                    title="Quero anunciar"
                    onPress={navigateAnunciante}
                  />

                  <View className="mt-2 mb-2">
                    <FilledButton
                      title="Quero descontos"
                      onPress={navigateCliente}
                    />
                  </View>

                  <View className="mb-2">
                    <FilledButton
                      title="Fazer Login"
                      backgroundColor={colors.secondary50}
                      onPress={() => setModalVisible(true)}
                    />
                  </View>
                </View>
              </View>
              <View className="absolute -bottom-2 w-full justify-center items-center">
                <Caption fontWeight={'bold'}>{versionName ?? ''}</Caption>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
