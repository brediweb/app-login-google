import { api } from '../../../service/api'
import { useEffect, useMemo, useRef, useState } from 'react'
import Toast from 'react-native-toast-message'
import { colors } from '../../../styles/colors'
import H5 from '../../../components/typography/H5'
import H3 from '../../../components/typography/H3'
import MapView, { Marker } from 'react-native-maps'
import type { Region } from 'react-native-maps'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import Geolocation from '@react-native-community/geolocation'
import { requestForegroundPermissionsAsync } from 'expo-location'
import FilledButton from '../../../components/buttons/FilledButton'
import { View, Platform, PermissionsAndroid, StyleSheet } from 'react-native'
import HeaderPrimary from '../../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'

interface ILocalizacao {
  latitude: number
  longitude: number
}

const DEFAULT_REGION: Region = {
  latitude: -15.7942,
  longitude: -47.8822,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
}

function coordenadasValidas(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  )
}

function normalizarCoordenada(coordinate: { latitude: number; longitude: number }) {
  return {
    latitude: Number(coordinate.latitude.toFixed(6)),
    longitude: Number(coordinate.longitude.toFixed(6)),
  }
}

export default function ClienteAtualizaLocal() {
  const { goBack } = useNavigate()
  const isFocused = useIsFocused()
  const mapRef = useRef<MapView>(null)
  const [regiao, setRegiao] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [inputLatitude, setInputLatitude] = useState('')
  const [inputLongitude, setInputLongitude] = useState('')
  const [localizacao, setLocalizacao] = useState<ILocalizacao>({
    latitude: 0,
    longitude: 0
  })
  const [localizacaoGPS, setLocalizacaoGPS] = useState<any>()
  const [permission, setPermission] = useState<any>(null)


  async function postPerfil() {
    setLoading(true)
    if (!regiao?.latitude || !regiao?.longitude) {
      Toast.show({
        type: 'error',
        text1: 'É necessário informar uma localização!',
      })
      setLoading(false)
      return;
    }
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const formData = {
          latitude: inputLatitude,
          longitude: inputLongitude
        }
        const response = await api.post(`/altera/anunciante`,
          formData,
          { headers }
        )
        setInputLatitude('')
        setInputLongitude('')
        Toast.show({
          type: 'success',
          text1: response.data.message ?? 'Localização atualizada com sucesso!',
        })
        goBack()
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Ocorreu algum erro, tente novamente!',
        })
        console.log("Error: ", error.response.data)
      }
    }
    setLoading(false)
  }

  async function getPerfil() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)

      try {
        const response = await api.get(`/perfil/pessoa-juridica/${newJson.id}`)
        const latitudeFormatada = parseFloat(response.data.results.latitude)
        const longitudeFormatada = parseFloat(response.data.results.longitude)
        setLocalizacao({
          latitude: latitudeFormatada,
          longitude: longitudeFormatada
        })
      } catch (error: any) {
        console.log('Erro detalhes perfil(Localização): ', error.response.data)
      }
    }
    setLoading(false)
  }

  function getLocalizacao() {
    Geolocation.getCurrentPosition(
      info => {
        setLocalizacaoGPS({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        })
      },
      error => {
        if (error.code === 3) {
          Toast.show({
            type: 'info',
            text1: 'Localização',
            text2: 'Não foi possível obter a localização a tempo. Tente em um local com melhor sinal ou ao ar livre.'
          })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 15000
      }
    )
  }

  async function getVerifica() {
    const { granted } = await requestForegroundPermissionsAsync()
    console.log('Verifica:', granted)
  }

  async function getPermissionIOS() {
    try {
      const { granted } = await requestForegroundPermissionsAsync()
      console.log('Permissão', granted)
    } catch (error: any) {
      console.log('ERRO: ', error);
    }
  }

  async function getPermissionAndroid() {
    Platform.OS === 'android' ?
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(granted => {
        if (granted.toString() == 'granted') {
          setPermission(true)
        } else {
          setPermission(false)
        }
        console.log('Permissão', granted);
      }).catch(error => {
        console.log('Erro', error);
      }) : console.log('Plataforma não é android');

  }

  const regiaoMapa = useMemo((): Region => {
    if (coordenadasValidas(localizacao.latitude, localizacao.longitude)) {
      return {
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }
    }
    if (localizacaoGPS) {
      return {
        latitude: localizacaoGPS.latitude,
        longitude: localizacaoGPS.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }
    }
    return DEFAULT_REGION
  }, [localizacao, localizacaoGPS])

  useEffect(() => {
    if (regiao?.latitude == null || regiao?.longitude == null) return
    setInputLatitude(String(regiao.latitude))
    setInputLongitude(String(regiao.longitude))
  }, [regiao])

  useEffect(() => {
    getPerfil()
  }, [isFocused])

  useEffect(() => {
    getVerifica()
    getLocalizacao()
    if (Platform.OS === 'ios') {
      getPermissionIOS()
    } else {
      getPermissionAndroid()
    }
  }, [])

  useEffect(() => {
    if (coordenadasValidas(localizacao.latitude, localizacao.longitude)) {
      setRegiao({
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
      })
    }
  }, [localizacao])

  useEffect(() => {
    if (coordenadasValidas(localizacao.latitude, localizacao.longitude)) return
    if (!localizacaoGPS) return
    setRegiao((prev: any) => {
      if (prev) return prev
      return {
        latitude: localizacaoGPS.latitude,
        longitude: localizacaoGPS.longitude,
      }
    })
  }, [localizacao, localizacaoGPS])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.animateToRegion(regiaoMapa, 400)
  }, [regiaoMapa.latitude, regiaoMapa.longitude])

  return (
    <MainLayoutAutenticado loading={loading} marginTop={0} marginHorizontal={0}>
      <HeaderPrimary titulo='Atualizar empreendimento' />
      <View className='flex-1 h-[60vh] w-full mt-4'>
        <View className='my-4 mx-6'>
          <H5>Clique em qualquer parte do mapa e arraste para posição desejada</H5>
        </View>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={regiaoMapa}
            zoomEnabled
            loadingEnabled
            showsTraffic={false}
            zoomTapEnabled
            showsBuildings={false}
            onPress={(event) => setRegiao(normalizarCoordenada(event.nativeEvent.coordinate))}
          >
            {regiao && (
              <Marker
                coordinate={{
                  latitude: regiao.latitude,
                  longitude: regiao.longitude,
                }}
                draggable
                onDragEnd={(e) => setRegiao(normalizarCoordenada(e.nativeEvent.coordinate))}
                pinColor={'#5D35F1'}
                anchor={{ x: 0.5, y: 1 }}
                tracksViewChanges={false}
                title='Localização selecionada'
              />
            )}
          </MapView>
        </View>
        {permission === false && (
          <View className='mx-4 mt-12'>
            <H3 align={'center'} color={colors.error30}>
              Para visualizar o mapa, é preciso conceder acesso à sua localização. Por favor, vá para as configurações do dispositivo e habilite o acesso à localização.
            </H3>
          </View>
        )}
      </View>
      <View className='mt-6 mx-6'>
        <FilledButton
          title='Atualizar'
          onPress={postPerfil}
          disabled={
            String(inputLatitude).length <= 4 || String(inputLongitude).length <= 4
          }
        />
      </View>
    </MainLayoutAutenticado >
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    minHeight: 280,
    width: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
    minHeight: 280,
  },
})
