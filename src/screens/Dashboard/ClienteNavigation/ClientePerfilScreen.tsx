import React from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet, Text, Image } from 'react-native'
import { useNavigate } from '../../../hooks/useNavigate'
import ButtonPerfil from '../../../components/buttons/ButtonPerfil'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import { colors } from '../../../styles/colors'

const MENU_ITEMS = [
  { label: 'Trocar Foto', screen: 'ClientePerfilTrocarFotoScreen' as const },
  { label: 'Atualizar Categoria', screen: 'ClientePerfilCategoriaScreen' as const },
  { label: 'Atualizar Informações', screen: 'ClientePerfilInformacoesScreen' as const },
  { label: 'Atualizar Localização de sua Empresa', screen: 'ClienteAtualizaLocal' as const },
  { label: 'Atualizar Horários de Funcionamento', screen: 'FormAtualizarHorarioScreen' as const },
]

export default function ClientePerfilScreen() {
  const { navigate } = useNavigate()

  return (
    <MainLayoutAutenticado notScroll marginTop={80} marginHorizontal={16}>
      <View
        style={{
          paddingHorizontal: 12,
          marginTop: 24,
        }}
      >
        <ButtonPerfil
          title='Perfil'
          fontsize={24}
          ativaicon={false}
          onPress={() => { }}
          image={require('../../../../assets/img/icons/edit.png')}
        />
      </View>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.item, index === MENU_ITEMS.length - 1 && styles.itemLast]}
              onPress={() => navigate(item.screen)}
              activeOpacity={0.6}
            >
              <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
              <Image
                source={require('../../../../assets/img/icons/arrow-r.png')}
                style={styles.arrow}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </MainLayoutAutenticado>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral90,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  label: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '500',
    color: colors.blackdark,
    marginRight: 12,
  },
  arrow: {
    opacity: 0.5,
    flexShrink: 0,
  },
})
