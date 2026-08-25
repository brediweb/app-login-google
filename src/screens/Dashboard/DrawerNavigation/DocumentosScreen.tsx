import { useEffect, useState } from 'react'
import { api } from '../../../service/api'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import ButtonFiltro from '../../../components/buttons/ButtonFiltro'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import { ScrollView, View } from 'react-native'
import React from 'react'

export default function DocumentosScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(true)
  const [documentos, setDocumentos] = useState([])

  async function getTermos() {
    setLoading(true)
    try {
      const response = await api.get(`/documentos`)
      setDocumentos(response.data.results)
    } catch (error: any) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    getTermos()
  }, [isFocused])


  return (
    <MainLayoutAutenticado
      notScroll={true}
      bottomDrawer
      loading={loading}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className='w-full h-20' />
        {documentos && documentos.map((documento: any) => {
          const titulo = documento.titulo
            ? documento.titulo.charAt(0).toUpperCase() + documento.titulo.slice(1).toLowerCase()
            : ''
          return (
            <ButtonFiltro
              key={documento.id}
              title={titulo}
              isActive={documento.status}
              onPress={() => navigate('TermoModeloScreen', { documento })}
            />
          )
        })}
      </ScrollView>
    </MainLayoutAutenticado>
  );
}
