import { api } from '../../../../service/api'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../../hooks/useNavigate'
import MapView, { Callout, Marker } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import ButtonMapa from '../../../../components/buttons/ButtonMapa'
import { requestForegroundPermissionsAsync } from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, StyleSheet, Platform, PermissionsAndroid, Dimensions } from 'react-native'
import H3 from '../../../../components/typography/H3'
import { colors } from '../../../../styles/colors'

const DEFAULT_REGION = {
  latitude: -15.7942,
  longitude: -47.8822,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function FiltroLocalizacaoScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [regiao, setRegiao] = useState<any>(null)
  const [listaOfertas, setListaOfertas] = useState<any>([])
  const [permissaoLocal, setPermissaoLocal] = useState<boolean>(false)
  const [listaAnunciantes, setListaAnunciantes] = useState<any>([])
  const [localizacaoErro, setLocalizacaoErro] = useState<string | null>(null)
  const [erroCarregarLocais, setErroCarregarLocais] = useState<string | null>(null)
  const [anunciantesCarregados, setAnunciantesCarregados] = useState(false)
  const mapRef = useRef<MapView>(null)

  async function getAnunciantes() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    setErroCarregarLocais(null)
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/listar/anunciantes`, { headers })
        setListaAnunciantes(response.data.results ?? [])
      } catch (error: any) {
        console.error('Erro Lista Anunciantes: ', error)
        setErroCarregarLocais('Não foi possível carregar os estabelecimentos no mapa. Tente novamente.')
      }
    }
    setAnunciantesCarregados(true)
  }

  async function getOfertas() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/cupons`, { headers })
        setListaOfertas(response.data.results)

      } catch (error: any) {
        console.error('Erro Lista Locais', error)
      }
    }
  }

  const solicitarPermissao = useCallback(async () => {
    if (Platform.OS === 'ios') {
      try {
        const { granted } = await requestForegroundPermissionsAsync()
        return granted
      } catch (error: any) {
        console.error('Erro ao solicitar permissão iOS', error)
        return false
      }
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (error) {
      console.error('Erro ao solicitar permissão Android', error)
      return false
    }
  }, [])

  const getLocalizacao = useCallback(async () => {
    const temPermissao = await solicitarPermissao()
    setPermissaoLocal(temPermissao)

    if (!temPermissao) {
      setLocalizacaoErro('Precisamos da sua permissão para localizar os estabelecimentos próximos.')
      return
    }

    Geolocation.getCurrentPosition(
      info => {
        setLocalizacaoErro(null)
        setRegiao({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        })
      },
      (error) => {
        if (error.code === 3) {
          setLocalizacaoErro('Não conseguimos obter sua localização a tempo. Tente novamente em uma área com melhor sinal.')
        } else {
          setLocalizacaoErro('Não foi possível obter sua localização. Verifique se o serviço está habilitado.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    )
  }, [solicitarPermissao])

  useEffect(() => {
    getLocalizacao()
  }, [getLocalizacao])

  useEffect(() => {
    getOfertas()
    getAnunciantes()
    getLocalizacao()
  }, [getLocalizacao, isFocused])

  useEffect(() => {
    if (regiao && mapRef.current) {
      const region = {
        latitude: regiao.latitude,
        longitude: regiao.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
      mapRef.current.animateToRegion(region, 500)
    }
  }, [regiao])

  const initialRegion = regiao
    ? {
        latitude: regiao.latitude,
        longitude: regiao.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsMyLocationButton
          showsUserLocation={!!permissaoLocal}
          onMapReady={() => {
            if (Platform.OS === 'android') {
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              ).then(granted => {
                setPermissaoLocal(granted === PermissionsAndroid.RESULTS.GRANTED)
              })
            }
            if (regiao && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: regiao.latitude,
                longitude: regiao.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }, 500)
            }
          }}
          initialRegion={initialRegion}
          zoomEnabled
          loadingEnabled
          showsTraffic={false}
          zoomTapEnabled
          showsBuildings={false}
        >
          {regiao && (
            <Marker
              pinColor="#f01"
              title="Você está aqui"
              coordinate={{
                latitude: regiao.latitude,
                longitude: regiao.longitude,
              }}
            />
          )}
          {listaAnunciantes?.map((item: any, index: number) =>
            item.latitude && item.longitude ? (
              <Marker
                key={`${item.id ?? index}-${item.latitude}`}
                pinColor="#5D35F1"
                calloutOffset={{ x: 0, y: 0 }}
                calloutAnchor={{ x: 0.5, y: 0.4 }}
                coordinate={{
                  latitude: parseFloat(item.latitude),
                  longitude: parseFloat(item.longitude),
                }}
              >
                <Callout
                  tooltip
                  alphaHitTest
                  onPress={() => navigate('FiltroDetalheLocalizacaoScreen', { item })}
                >
                  <ButtonMapa
                    title={item.empresa}
                    image={item.imagem_empresa}
                  />
                </Callout>
              </Marker>
            ) : null
          )}
        </MapView>
      </View>
      {localizacaoErro &&
        <View style={styles.mensagemContainer}>
          <H3 align={'center'} color={colors.error30}>{localizacaoErro}</H3>
        </View>
      }
      {erroCarregarLocais &&
        <View style={styles.mensagemContainer}>
          <H3 align={'center'} color={colors.error30}>{erroCarregarLocais}</H3>
        </View>
      }
      {regiao && anunciantesCarregados && !erroCarregarLocais &&
        !listaAnunciantes.some((item: any) => item?.latitude && item?.longitude) &&
        <View style={styles.mensagemContainer}>
          <H3 align={'center'} color={colors.blackdark}>
            Nenhum estabelecimento com localização disponível para exibir no mapa.
          </H3>
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
  },
  mapWrapper: {
    flex: 1,
    width: '100%',
    minHeight: Math.max(SCREEN_HEIGHT * 0.5, 300),
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mensagemContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingHorizontal: 8,
  },
})
