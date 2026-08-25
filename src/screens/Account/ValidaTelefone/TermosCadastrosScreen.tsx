import { View } from 'react-native'
import { api } from '../../../service/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from '../../../hooks/useNavigate'
import ButtonFiltro from '../../../components/buttons/ButtonFiltro'
import HeaderPrimary from '../../../components/header/HeaderPrimary'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'

export default function TermosCadastrosScreen({ navigation }: { navigation: any }) {
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
  }, [])

  return (
    <>
      <MainLayoutAutenticado loading={loading} marginTop={0} marginHorizontal={0}>
        <HeaderPrimary
          titulo='Termos e Políticas'
          descricao=''
        />
        <View className='mx-6 mt-2'>
          {documentos && documentos.map((documento: any) => (
            <ButtonFiltro
              isActive={documento.status}
              key={documento.id}
              title={documento.titulo}
              onPress={() => navigate('TermoModeloScreen', { documento })}
            />
          ))}
        </View>
      </MainLayoutAutenticado>
    </>
  );
}


