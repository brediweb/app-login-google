import { Text, View, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { api } from '../../../../../service/api'
import { colors } from '../../../../../styles/colors'
import { useIsFocused } from '@react-navigation/native'
import H3 from '../../../../../components/typography/H3'
import H1 from '../../../../../components/typography/H1'
import Caption from '../../../../../components/typography/Caption'
import AsyncStorage from '@react-native-async-storage/async-storage'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import CardConsumo from '../../../../../components/cards/Cliente/CardConsumo'
import MainLayoutAutenticado from '../../../../../components/layout/MainLayoutAutenticado'
import Paragrafo from '@components/typography/Paragrafo'
import { createNumberMask } from 'react-native-mask-input'
import { format } from 'date-fns'
import React from 'react'

interface PropsConsumo {
  total_gasto: string,
  cupons_gerados: number,
  cupons_favoritos: number,
  cupons_consumidos: number,
  cupons_disponiveis: number,
  periodo_teste:
  {
    ativo: string,
    data_criacao: string,
    data_fim: string,
    data_inicio: string,
    id: any,
  },

  extrato: [
    {
      codigo_pix: string
      data: string
      endereco_entrega: string
      forma_pagamento: string
      id: any
      status: string
      total: any
      uuid: string
    },
  ]
}

export default function ClienteConsumoScreen() {
  const isFocused = useIsFocused()
  const [loading, setLoading] = useState(true)
  const [dadosConsumo, setDadosConsumo] = useState<PropsConsumo>()

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

  const formatarMoeda = (texto: string | number) => {
    const textoStr = String(texto); // força ser string

    const somenteNumeros = textoStr.replace(/\D/g, '');
    const numero = parseFloat(somenteNumeros);

    if (isNaN(numero)) return '';

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  function dataFormatada(dataPura: any) {
    const dataOriginal = new Date(dataPura);
    return format(dataOriginal, 'dd/MM/yyyy');
  }

  // Função para formatar nome do mês e ano
  const obterMesAno = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Agrupar por mês/ano
  const agruparPorMes = (extratos: any[]) => {
    return extratos.reduce((acc, extrato) => {
      const mesAno = obterMesAno(extrato.data);
      if (!acc[mesAno]) {
        acc[mesAno] = [];
      }
      acc[mesAno].push(extrato);
      return acc;
    }, {} as Record<string, any[]>);
  };

  useEffect(() => {
    getConsumo()
  }, [])

  useEffect(() => {
    if (isFocused) {
      getConsumo()
    }
  }, [isFocused])

  return (
    <MainLayoutAutenticado marginTop={0} marginHorizontal={0} loading={loading}>
      <View className='w-full mt-6' />
      <HeaderPrimary titulo='Consumo' />
      <View className='mx-7 mt-5 min-h-full'>
        <View className='rounded-lg p-3' style={{ borderWidth: 3, borderColor: colors.tertiary20, backgroundColor: '#EEF0FF' }}>
          <H3 color={colors.tertiary20} >Total gasto</H3>
          <H1 title={`R$ ${dadosConsumo?.total_gasto ?? 0.00}`} fontsize={36} fontWeight={'500'} color={colors.tertiary20} />
        </View>

        {/* <View className='mt-8'>
          <View className='flex-row mt-4'>
            <View className='rounded-tl rounded-bl w-1/3 h-9' style={{ backgroundColor: '#296FF5' }}></View>
            <View className=' w-1/3 h-9' style={{ backgroundColor: colors.tertiary20 }}></View>
            <View className='rounded-tr rounded-br w-1/3 h-9' style={{ backgroundColor: colors.tertiary80 }}></View>
          </View>
          <View className='flex-row mt-2'>
            <View className='rounded-tl rounded-bl w-1/3 h-9'>
              <Caption >
                Disponíveis
              </Caption>
            </View>
            <View className=' w-1/3 h-9'>
              <Caption align={'right'}>
                Consumidos
              </Caption>
            </View>
            <View className='rounded-tr rounded-br w-1/3 h-9'>
              <Caption align={'right'}>
                Gerados
              </Caption>
            </View>
          </View>
        </View> */}

        <CardConsumo
          titulo='Cupons disponíveis'
          quantidade={dadosConsumo?.cupons_disponiveis ?? "0"}
        />
        <CardConsumo
          titulo='Cupons gerados'
          quantidade={dadosConsumo?.cupons_gerados ?? "0"}
        />
        <CardConsumo
          titulo='Cupons consumidos'
          quantidade={dadosConsumo?.cupons_consumidos ?? "0"}
        />
        <CardConsumo
          titulo='Cupons favoritos'
          quantidade={dadosConsumo?.cupons_favoritos ?? "0"}
        />

        <View className='mt-8'>
          <H3 color={colors.tertiary20} >Pacote de Teste</H3>

          {dadosConsumo && dadosConsumo.periodo_teste &&
            <View className="mt-3">
              <View
                className="mt-2 border-solid border-2 px-2 py-4 rounded-xl"
                style={{ borderColor: colors.secondary70 }}
              >
                <H1 fontWeight={'bold'} fontsize={16} title={`Data de início:`} />
                <Paragrafo title={`${dadosConsumo.periodo_teste.data_inicio}`} />
                <View className='w-full h-1' />
                <H1 fontWeight={'bold'} fontsize={16} title={`Data fim:`} />
                <Paragrafo title={`${dadosConsumo.periodo_teste.data_fim}`} />
                <View className='w-full h-1' />
                <H1 fontWeight={'bold'} fontsize={16} title={`Status:`} />
                <Paragrafo title={`${dadosConsumo.periodo_teste.ativo ? 'Ativo' : 'Utilizado'}`} />
              </View>
            </View>
          }
        </View>

        <View className='mt-8'>
          <H3 color={colors.tertiary20}>Extrato Completo</H3>
        </View>
        <View className='mt-3'>
          {dadosConsumo && (() => {
            const agrupado = agruparPorMes(dadosConsumo.extrato);
            return Object.entries(agrupado).map(([mes, extratos]) => (
              <View key={mes} style={styles.mesBlock}>
                <Text style={styles.mesLabel}>{mes}</Text>
                {(extratos as any[]).map((extrato: any, index: number) => (
                  <View key={`${extrato.id ?? index}-${extrato.data}`} style={styles.miniCard}>
                    <View style={styles.miniCardRow}>
                      <Text style={styles.miniCardData}>{dataFormatada(extrato.data)}</Text>
                      <Text style={styles.miniCardValor}>{formatarMoeda(extrato.total)}</Text>
                    </View>
                    <Text style={styles.miniCardDetalhe}>
                      {extrato.status} • {extrato.forma_pagamento}
                    </Text>
                  </View>
                ))}
              </View>
            ));
          })()}
        </View>

      </View>
    </MainLayoutAutenticado>
  )
}

const styles = StyleSheet.create({
  mesBlock: {
    marginBottom: 20,
  },
  mesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutralvariant60,
    textTransform: 'capitalize',
    marginBottom: 8,
    paddingLeft: 2,
  },
  miniCard: {
    backgroundColor: colors.neutral99,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.neutralvariant90,
  },
  miniCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniCardData: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral10,
  },
  miniCardValor: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.tertiary20,
  },
  miniCardDetalhe: {
    fontSize: 12,
    color: colors.neutralvariant60,
    marginTop: 4,
  },
})
