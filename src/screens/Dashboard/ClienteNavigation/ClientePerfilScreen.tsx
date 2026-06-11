import React from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet, Text, Image, ImageSourcePropType } from 'react-native'
import { useNavigate } from '../../../hooks/useNavigate'
import ButtonPerfil from '../../../components/buttons/ButtonPerfil'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import { colors } from '../../../styles/colors'
import Caption from '../../../components/typography/Caption'

type MenuItem = {
  label: string
  description: string
  screen:
    | 'ClientePerfilTrocarFotoScreen'
    | 'ClientePerfilCategoriaScreen'
    | 'ClientePerfilInformacoesScreen'
    | 'ClienteAtualizaLocal'
    | 'FormAtualizarHorarioScreen'
  icon: ImageSourcePropType
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Trocar Foto',
    description: 'Altere a logomarca exibida no seu perfil e nas ofertas publicadas.',
    screen: 'ClientePerfilTrocarFotoScreen',
    icon: require('../../../../assets/img/icons/perfil-menu.png'),
  },
  {
    label: 'Atualizar Categoria',
    description: 'Escolha a categoria do seu negócio para facilitar a busca dos clientes.',
    screen: 'ClientePerfilCategoriaScreen',
    icon: require('../../../../assets/img/icons/edit.png'),
  },
  {
    label: 'Atualizar Informações',
    description: 'Edite nome, endereço, telefone, e-mail e demais dados cadastrais.',
    screen: 'ClientePerfilInformacoesScreen',
    icon: require('../../../../assets/img/icons/doc.png'),
  },
  {
    label: 'Atualizar Localização da Empresa',
    description: 'Defina no mapa o ponto exato onde sua empresa aparece para os clientes.',
    screen: 'ClienteAtualizaLocal',
    icon: require('../../../../assets/img/icons/estabelecimento.png'),
  },
  {
    label: 'Atualizar Horários de Funcionamento',
    description: 'Informe os dias e horários em que seu estabelecimento está aberto.',
    screen: 'FormAtualizarHorarioScreen',
    icon: require('../../../../assets/img/icons/settings.png'),
  },
]

export default function ClientePerfilScreen() {
  const { navigate } = useNavigate()

  return (
    <MainLayoutAutenticado notScroll marginTop={80} marginHorizontal={16}>
      <View style={styles.header}>
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
              <View style={styles.iconWrapper}>
                <Image source={item.icon} style={styles.icon} resizeMode='contain' />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
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
  header: {
    paddingHorizontal: 12,
    marginTop: 24,
  },
  introCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary90,
    borderWidth: 1,
    borderColor: colors.primary80,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary20,
    marginBottom: 6,
  },
  container: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral90,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral90,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary90,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: colors.primary40,
  },
  textContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.blackdark,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutralvariant50,
  },
  arrow: {
    opacity: 0.45,
    flexShrink: 0,
  },
})
