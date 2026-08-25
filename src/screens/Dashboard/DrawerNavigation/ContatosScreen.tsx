import { api } from '../../../service/api'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { colors } from '../../../styles/colors'
import H6 from '../../../components/typography/H6'
import H5 from '../../../components/typography/H5'
import Caption from '../../../components/typography/Caption'
import { Image, Linking, TouchableOpacity, View } from 'react-native'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import React from 'react'

export default function ContatosScreen() {
  const [loading, setLoading] = useState(true)
  const [listaContato, setListaContato] = useState([])

  async function getContato() {
    setLoading(true)
    try {
      const response = await api.get(`/contato`)
      if (!response.data.error) {
        setListaContato(response.data.results)
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message ?? 'Ocorreu um erro, tente novamente',
        })
      }
    } catch (error: any) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: error.response.data.erro ?? 'Ocorreu um erro interno!',
      })
    }
    setLoading(false)
  }

  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3");
    return phone;
  }

  const handleCNPJMask = (value: any) => {
    let cnpj = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{2})$/, "$1-$2")
    return cnpj
  }

  useEffect(() => {
    getContato()
  }, [])

  return (
    <MainLayoutAutenticado bottomDrawer loading={loading}>
      <Image className='mx-auto mt-16' source={require('../../../../assets/img/ajuda/atendente-24h.png')} />
      <View className='mb-4'>
        <H5>Precisa de ajuda?</H5>
        <Caption fontSize={14}>Qualquer dúvida ou problema relacionado a utilização do aplicativo entre em contato com o nosso time de suporte através de e-mail ou WhatsApp!</Caption>
      </View>

      {listaContato && listaContato.map((item: any) => (
        <View key={item.id}>
          <TouchableOpacity onPress={() => Linking.openURL(`${item.telefone_whatsapp}`)} className='flex-row w-full justify-center rounded p-2 bg-[#F0F0F0] mb-3' style={{ borderColor: colors.blackbase, borderWidth: 1 }}>
            <Image source={require('../../../../assets/img/icons/whatsapp.png')} />
            <H6>Clique para enviar mensagem</H6>
          </TouchableOpacity>

          <View className=' items-center justify-center mb-24'>
            <Caption>Empresa</Caption>
            <H6>{item.nome_empresa}</H6>
            <Caption margintop={12}>CNPJ</Caption>
            <H6>{handleCNPJMask(item.cnpj)}</H6>
            <Caption margintop={12}>Telefone de contato</Caption>
            <H6>{handlePhoneMask(item.telefone)}</H6>
            <Caption margintop={12}>E-mail de contato</Caption>
            <H6>{item.email}</H6>
            <Caption margintop={12}>E-mail DPO</Caption>
            <H6>{item.email_dpo}</H6>
          </View>
        </View>
      ))}

    </MainLayoutAutenticado>
  );
}
