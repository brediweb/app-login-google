import { api } from '../../../service/api'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import { useGlobal } from '../../../context/GlobalContextProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'

interface PropsConsumo {
  total_gasto: string,
  cupons_gerados: number,
  cupons_favoritos: number,
  cupons_consumidos: number,
  cupons_disponiveis: number,
  ofertas_disponiveis: number
}

export default function HomeClienteScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(true)
  const [ofertas, setOferta] = useState<any>([])
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [dadosPerfil, setDadosPerfil] = useState<any>([])
  const [pacoteGratis, setPacoteGratis] = useState(false)
  const [dadosConsumo, setDadosConsumo] = useState<PropsConsumo>()
  const { statusTesteGratis, setStatusTesteGratis, usuarioLogado } = useGlobal()
  const [modalPacoteGratis, setModalPacoteGratis] = useState(false)
  const [assinaturasAtivas, setAssinaturasAtivas] = useState<any>([])

  async function getPacoteGratis() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      const headers = {
        Authorization: `Bearer ${newJson.token}`
      }
      try {
        const response = await api.post(`/verifiaca-teste-gratis`, {}, {
          headers: headers
        })
        setPacoteGratis(response.data.results.pacote_disponivel)
        setStatusTesteGratis(response.data.results.pacote_disponivel)
      } catch (error: any) {
        console.error('GET Pacote Gratuito: ', error.response.data.message)
      }
      getDadosPerfil()
      setLoading(false)
    }
    getDadosPerfil()
  }

  async function getDadosPerfil() {
    setDadosPerfil([])
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const dadosStorageUser = JSON.parse(jsonValue)

      try {
        const response = await api.get(`/perfil/pessoa-juridica/${dadosStorageUser.id}`)
        setDadosPerfil(response.data.results)
        setPrimeiroNome(response.data.results.nome_represetante.split(' ')[0])
        const jsonValue = JSON.stringify(response.data.results)
        await AsyncStorage.setItem('dados-perfil', jsonValue)
      } catch (error: any) {
        console.error('GET Dados Perfil(Anunciante): ', error.response.data.message)
      }
    }
    setLoading(false)
  }

  async function getOfertas() {
    setLoading(true)
    const jsonUsuario = await AsyncStorage.getItem('infos-user')
    if (jsonUsuario) {
      const newJson = JSON.parse(jsonUsuario)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
          'Content-Type': 'multipart/form-data'
        }
        const response = await api.get(`/meus-cupons/anunciante`, { headers })
        setOferta(response.data.results)
      } catch (error: any) {
        console.error('GET ERROR Minhas Ofertas: ', error)
      }
    }
    setLoading(false)
  }

  async function getConsumo() {
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        const headers = {
          Authorization: `Bearer ${newJson.token}`
        }
        const response = await api.get(`/consumo`, { headers })
        setDadosConsumo(response.data.results)
      }
    } catch (error: any) {
      console.error('ERROR GET - CONSUMO', error.response.data)
    }
    setLoading(false)
  }

  async function getAssinaturaAtiiva() {
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        const headers = {
          Authorization: `Bearer ${newJson.token}`
        }
        const response = await api.get(`/pagamento/assinatura/minhas`, { headers })
        setAssinaturasAtivas(response.data.results)
      }
    } catch (error: any) {
      console.error('ERROR GET - CONSUMO', error.response.data)
    }
    setLoading(false)
  }

  const handleGo = () => {
    navigate('ClientePacotesScreen')
    setModalPacoteGratis(false)
  }

  useEffect(() => {
    if (isFocused) {
      getOfertas()
      getConsumo()
      getPacoteGratis()
      getAssinaturaAtiiva()
    }
  }, [isFocused])

  useEffect(() => {
    getPacoteGratis()
  }, [statusTesteGratis])

  useEffect(() => {
    if (pacoteGratis && statusTesteGratis) {
      setModalPacoteGratis(true)
    }
  }, [pacoteGratis, statusTesteGratis])

  return (
    <MainLayoutAutenticado loading={loading}>

      <View className='w-full mt-20'>

        <View className="flex-row">
          <Text className="text-[24px] font-semibold text-[#000] mb-3"> Boas-vindas, {primeiroNome ?? ''} 🎉</Text>
        </View>

        <View>
          {assinaturasAtivas &&
            <TouchableOpacity
              onPress={() => navigate('ClienteAssinaturaScreen')}
              className="flex flex-row bg-[#f1eeff] border-2 border-[#775aff] rounded-xl justify-between p-2 py-4 mt-3">
              <View className='w-[64vw]'>
                <Text className='font-semibold text-6xl text-[#2f009c]'>
                  {assinaturasAtivas && assinaturasAtivas.assinaturas
                    ? assinaturasAtivas.assinaturas.filter((item: any) => item.pode_cancelar === true).length
                    : 0}
                </Text>
                <Text className='font-semibold text-[#2f009c]'>Plano de recorrência ativo</Text>
              </View>
              <View className='w-[18vw]'>
                <Image source={require('../../../../assets/img/icons/icoVigentes.png')} />
              </View>
            </TouchableOpacity>
          }
          <View className="flex flex-row bg-[#f1eeff] border-2 border-[#775aff] rounded-xl justify-between p-2 py-4 mt-3">
            <View className='w-[64vw]'>
              <Text className='font-semibold text-6xl text-[#2f009c]'>
                {dadosConsumo?.ofertas_disponiveis}
              </Text>
              <Text className='font-semibold text-[#2f009c]'>Anúncios disponíveis</Text>
            </View>
            <View className='w-[18vw]'>
              <Image source={require('../../../../assets/img/icons/icoVigentes.png')} />
            </View>
          </View>
          <View className="flex flex-row bg-[#f1eeff] border-2 border-[#775aff] rounded-xl justify-between p-2 py-4 mt-3">
            <View className='w-[64vw]'>
              <Text className='font-semibold text-6xl text-[#2f009c]'>
                {dadosConsumo?.cupons_disponiveis}
              </Text>
              <Text className='font-semibold text-[#2f009c]'>Anúncios ativos</Text>
            </View>
            <View className='w-[18vw]'>
              <Image source={require('../../../../assets/img/icons/icoVigentes.png')} />
            </View>
          </View>
          <View className="flex flex-row bg-[#f1eeff] border-2 border-[#775aff] rounded-xl justify-between p-2 py-4 mt-3">
            <View className='w-[64vw]'>
              <Text className='font-semibold text-6xl text-[#2f009c]'>
                {dadosConsumo?.cupons_consumidos} / {dadosConsumo?.cupons_gerados}
              </Text>
              <Text className='font-semibold text-[#2f009c]'>Cupons consumidos / gerados</Text>
            </View>
            <View className='w-[18vw]'>
              <Image source={require('../../../../assets/img/icons/icoPublicados.png')} />
            </View>
          </View>
          {/* <View className="flex flex-row bg-[#f1eeff] border-2 border-[#775aff] rounded-xl justify-between p-2 py-4 mt-3">
            <View className='w-[64vw]'>
              <Text className='font-semibold text-6xl text-[#2f009c]'>{dadosConsumo?.cupons_consumidos}</Text>
              <Text className='font-semibold text-[#2f009c]'>Cupons Utilizados</Text>
            </View>
            <View className='w-[18vw]'>
              <Image source={require('../../../../assets/img/icons/icoConsumidos.png')} />
            </View>
          </View> */}
          <View className="flex flex-row bg-[#f1eeff] border-2 border-[#775aff] rounded-xl justify-between p-2 py-4 mt-3">
            <View className='w-[64vw]'>
              <Text className='font-semibold text-6xl text-[#2f009c]'>{dadosConsumo?.cupons_favoritos}</Text>
              <Text className='font-semibold text-[#2f009c]'>Favoritos</Text>
            </View>
            <View className='w-[18vw]'>
              <Image source={require('../../../../assets/img/icons/icoFavoritos.png')} />
            </View>
          </View>

        </View>

        <Modal visible={modalPacoteGratis} animationType='slide' presentationStyle='fullScreen'>
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHero}>
                  <View style={styles.modalGiftWrapper}>
                    <Image source={require('../../../../assets/img/icons/icoGift.png')} style={styles.modalGiftIcon} resizeMode='contain' />
                  </View>
                  <Text style={styles.modalTitle}>Receba!</Text>
                  <Text style={styles.modalSubtitle}>Aproveite o pacote gratuito que temos para você</Text>
                </View>

                <View style={styles.modalBenefits}>
                  <View style={styles.modalBenefitCard}>
                    <Text style={styles.modalBenefitText}>
                      Venda seus produtos e serviços com cupons e ofertas exclusivas
                    </Text>
                  </View>
                  <View style={styles.modalBenefitCard}>
                    <Text style={styles.modalBenefitText}>Experimente o Discontapp sem compromisso</Text>
                  </View>
                  <View style={styles.modalBenefitCard}>
                    <Text style={styles.modalBenefitText}>Comece a vender e economizar hoje</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={handleGo} style={styles.modalCta} activeOpacity={0.85}>
                <Text style={styles.modalCtaText}>Vamos lá</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalPacoteGratis(false)}
                style={styles.modalVerMaisTarde}
                activeOpacity={0.85}
              >
                <Text style={styles.modalVerMaisTardeText}>Ver mais tarde</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {dadosPerfil?.latitude?.length <= 4 && dadosPerfil?.longitude?.length <= 4 &&
          <TouchableOpacity onPress={() => navigate('ClienteAtualizaLocal')} className="flex-row items-center bg-[#EEF0FF] border-4 border-solid border-[#002B72] rounded p-2 mt-4">
            <View className="flex-1">
              <Text className="text-[#002B72] text-[13px] font-bold">Não esqueça de atualizar o local de sua empresa</Text>
              <Text className="text-[#002B72] text-[36px] font-bold">Empresa</Text>
            </View>
            <View className='flex-1 items-end'>
              <Image className='w-24 h-24' source={require('../../../../assets/img/icons/mapa-atualiza.png')} />
            </View>
          </TouchableOpacity>
        }
      </View>
    </MainLayoutAutenticado >
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalHeaderSpacer: { flex: 1 },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseIcon: {
    width: 24,
    height: 24,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalHero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  modalGiftWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#C9BFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalGiftIcon: {
    width: 45,
    height: 45,
  },
  modalTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#313033',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#79757F',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  modalBenefits: {
    marginTop: 8,
  },
  modalBenefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5DEFF',
  },
  modalBenefitText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#48454E',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  modalCta: {
    backgroundColor: '#5D35F1',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCtaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalVerMaisTarde: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalVerMaisTardeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#79757F',
  },
})
