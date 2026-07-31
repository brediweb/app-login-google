import { View, Text, Image, TouchableOpacity, Modal, Platform, PermissionsAndroid, Linking, StyleSheet, StyleProp, ImageStyle, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../service/api';
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado';
import MapView, { Marker } from 'react-native-maps';
import H3 from '../../components/typography/H3'
import H5 from '../../components/typography/H5'
import Caption from '../../components/typography/Caption'
import { colors } from '../../styles/colors';
import { requestForegroundPermissionsAsync } from 'expo-location';
import FilledButton from '../../components/buttons/FilledButton';
import Spacing from '@components/layout/Spacing'
import { useNavigate } from '../../hooks/useNavigate'

const LOGO_DISCONTOKEN_FALLBACK = require('../../../assets/img/logoHeader.png')

function CupomLogo({
    uri,
    style,
}: {
    uri?: string | null
    style: StyleProp<ImageStyle>
}) {
    const [falhou, setFalhou] = useState(false)
    const uriValida = typeof uri === 'string' && uri.trim().length > 0

    if (!uriValida || falhou) {
        return (
            <Image
                source={LOGO_DISCONTOKEN_FALLBACK}
                style={style}
                resizeMode="contain"
            />
        )
    }

    return (
        <Image
            source={{ uri: uri.trim() }}
            style={style}
            resizeMode="cover"
            onError={() => setFalhou(true)}
        />
    )
}

function LinhaDadoModal({
    label,
    valor,
}: {
    label: string
    valor?: string | number | null
}) {
    if (valor == null || String(valor).trim() === '') return null
    return (
        <View style={modalStyles.linhaDado}>
            <Caption fontSize={12} color={colors.neutralvariant60}>
                {label}
            </Caption>
            <Caption fontSize={14} margintop={4} color={colors.neutral10}>
                {String(valor)}
            </Caption>
        </View>
    )
}

const modalStyles = StyleSheet.create({
    linhaDado: {
        marginTop: 12,
        paddingBottom: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.neutralvariant90,
    },
    modalHero: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalLogoBox: {
        width: 80,
        height: 80,
        borderRadius: 14,
        marginRight: 12,
        overflow: 'hidden',
        backgroundColor: colors.neutral90,
        borderWidth: 1,
        borderColor: colors.neutralvariant90,
    },
    modalLogoImg: {
        width: '100%',
        height: '100%',
    },
    modalTitulo: {
        flex: 1,
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 18,
        color: colors.neutral10,
        lineHeight: 24,
    },
    modalPercent: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 32,
        color: colors.primary40,
        marginTop: 4,
    },
    scrollModal: {
        maxHeight: 420,
    },
})

export default function DiscotokenListagemScreen() {

    const [cupons, setCupons] = useState([])
    const [cupomAtual, setCupomAtual] = useState({} as any)
    const [isModal, setIsModal] = useState(false)
    const [permissaoLocal, setPermissaoLocal] = useState(false)
    const [usuarioCliente, setUsuarioCliente] = useState<number | null>(null)
    const { navigate } = useNavigate()

    async function getCupons() {
        const jsonValue = await AsyncStorage.getItem('infos-user')
        if (jsonValue) {
            const newJson = JSON.parse(jsonValue)
            setUsuarioCliente(newJson.id ?? null)
            try {
                const headers = {
                    Authorization: `Bearer ${newJson.token}`,
                    Accept: 'application/json',
                }
                const response = await api.get(`/discotoken/anunciantes`, { headers })
                setCupons(response.data.results.anunciantes)
            } catch (error: any) {
                console.log('ERROR GET CUPONS ', error)
            }
        }
    }

    function handleCupom(cupom: any) {
        setCupomAtual(cupom)
        setIsModal(true)
    }

    function handleGerarQrCode() {
        setIsModal(false)
        navigate('DiscotokenQrCodeScreen', {
            cupom: cupomAtual,
            usuarioCliente,
        })
    }

    async function getPermissionIOS() {
        try {
            const { granted } = await requestForegroundPermissionsAsync()
            if (granted) {
                setPermissaoLocal(true)
            } else {
                setPermissaoLocal(false)
            }
        } catch (error: any) {
            console.log('ERRO', error);
        }
    }

    async function solicitarPermissaoLocal() {
        if (parseFloat(cupomAtual?.anunciante?.latitude) && parseFloat(cupomAtual?.anunciante?.longitude)) {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Permissão de Localização',
                        message: 'Este aplicativo precisa de permissão para acessar sua localização.',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setPermissaoLocal(true)
                } else {
                    setPermissaoLocal(false)
                }
            } catch (err) {
                console.warn(err);
            }
        }
    }

    useEffect(() => {
        getCupons()
        if (Platform.OS === 'ios') {
            getPermissionIOS()
        }
    }, [])

    const anuncianteModal = cupomAtual?.anunciante ?? {}
    const descricaoModal =
        anuncianteModal.descricao_empresa ??
        anuncianteModal.descricao ??
        cupomAtual?.descricao ??
        anuncianteModal.descricao_completa ??
        ''
    const latModal = parseFloat(String(anuncianteModal.latitude ?? ''))
    const lngModal = parseFloat(String(anuncianteModal.longitude ?? ''))
    const coordsModalOk =
        Number.isFinite(latModal) &&
        Number.isFinite(lngModal)

    return (
        <MainLayoutAutenticado marginTop={64} marginHorizontal={16}>
            <Spacing />
            <View style={styles.introBox}>
                <H5 color={colors.primary40}>Discontoken</H5>
                <Caption fontSize={14} margintop={10} color={colors.neutral10}>
                    O Discontoken é um identificador digital (QR Code) que dá acesso a descontos exclusivos em estabelecimentos parceiros.
                </Caption>
                <Caption fontSize={14} margintop={10} color={colors.neutral10}>
                    Mais do que um cupom, ele funciona como uma ponte entre associações, associados e empresas, criando um ecossistema de vantagens:
                </Caption>
                <Caption fontSize={14} margintop={8} color={colors.neutral10}>
                    • O associado economiza
                </Caption>
                <Caption fontSize={14} margintop={4} color={colors.neutral10}>
                    • A empresa vende mais
                </Caption>
                <Caption fontSize={14} margintop={4} color={colors.neutral10}>
                    • A associação entrega valor real
                </Caption>
                <Caption fontSize={14} margintop={10} color={colors.neutral10}>
                    Tudo integrado dentro da plataforma Discontapp.
                </Caption>
            </View>
            {cupons.map((cupom: any) => (
                <TouchableOpacity
                    key={cupom.id}
                    activeOpacity={0.9}
                    onPress={() => handleCupom(cupom)}
                    style={styles.couponTouchable}
                >
                    <View style={styles.couponCard}>
                        <View style={styles.couponStripe} />
                        <View style={styles.couponInner}>
                            <View style={styles.logoWrap}>
                                <CupomLogo uri={cupom?.photo} style={styles.logo} />
                            </View>
                            <View style={styles.perforation}>
                                <View style={styles.lineDash} />
                            </View>
                            <View style={styles.couponTextBlock}>
                                <Text
                                    style={styles.nomeFantasia}
                                    numberOfLines={2}
                                >
                                    {cupom?.anunciante?.nome_fantasia}
                                </Text>
                                <Text style={styles.desconto}>
                                    {cupom?.anunciante?.vantagem_porcentagem_discotoken}%
                                </Text>
                                <Text style={styles.descontoLabel}>Discontoken</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
            <Modal animationType="slide" transparent visible={isModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderTitle}>Discontoken</Text>
                            <TouchableOpacity onPress={() => setIsModal(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                <Image source={require('../../../assets/img/closeButton.png')} style={{ width: 16, height: 16 }} resizeMode="contain" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={modalStyles.scrollModal}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                        >
                            <View style={modalStyles.modalHero}>
                                <View style={modalStyles.modalLogoBox}>
                                    <CupomLogo uri={cupomAtual?.photo} style={modalStyles.modalLogoImg} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={modalStyles.modalTitulo} numberOfLines={3}>
                                        {anuncianteModal.nome_fantasia ?? 'Estabelecimento'}
                                    </Text>
                                    {anuncianteModal.vantagem_porcentagem_discotoken != null && (
                                        <Text style={modalStyles.modalPercent}>
                                            {anuncianteModal.vantagem_porcentagem_discotoken}%
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {String(descricaoModal).trim().length > 0 && (
                                <View style={{ marginTop: 4 }}>
                                    <Caption fontSize={12} color={colors.neutralvariant60}>
                                        Sobre o estabelecimento
                                    </Caption>
                                    <Caption fontSize={14} margintop={6} color={colors.neutral10}>
                                        {String(descricaoModal).trim()}
                                    </Caption>
                                </View>
                            )}

                            <View style={{ marginTop: 16 }}>
                                <FilledButton onPress={handleGerarQrCode} title="Gerar QR Code Discontoken" />
                            </View>

                            <LinhaDadoModal label="Nome empresarial" valor={anuncianteModal.nome_empresarial} />
                            <LinhaDadoModal label="Endereço" valor={anuncianteModal.endereco} />
                            <LinhaDadoModal label="Telefone" valor={anuncianteModal.telefone} />
                            <LinhaDadoModal label="E-mail" valor={anuncianteModal.email} />
                            <LinhaDadoModal label="CNPJ" valor={anuncianteModal.cnpj} />
                            <LinhaDadoModal label="Cidade" valor={anuncianteModal.cidade} />
                            <LinhaDadoModal label="Estado" valor={anuncianteModal.estado ?? anuncianteModal.uf} />

                            {!permissaoLocal ? (
                                <View style={{ marginTop: 16, paddingTop: 12 }}>
                                    <H3 align="center" color={colors.error30}>
                                        Para visualizar o mapa, é preciso conceder acesso à sua localização. Por favor, vá para as configurações do dispositivo e habilite o acesso à localização.
                                    </H3>
                                    <View style={{ height: 12 }} />
                                    <FilledButton onPress={() => solicitarPermissaoLocal()} title="Ir para configurações" />
                                </View>
                            ) : coordsModalOk ? (
                                <View style={{ marginTop: 16 }}>
                                    <Caption fontSize={12} color={colors.neutralvariant60} margintop={4}>
                                        Localização
                                    </Caption>
                                    <MapView
                                        style={styles.modalMap}
                                        region={{
                                            latitude: latModal,
                                            longitude: lngModal,
                                            latitudeDelta: 0.0922,
                                            longitudeDelta: 0.0421,
                                        }}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: latModal,
                                                longitude: lngModal,
                                            }}
                                            title={anuncianteModal.nome_fantasia}
                                        />
                                    </MapView>
                                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                Linking.openURL(
                                                    `https://www.google.com/maps?q=${latModal},${lngModal}`
                                                )
                                            }
                                            style={{
                                                backgroundColor: colors.secondary50,
                                                borderRadius: 999,
                                                paddingVertical: 10,
                                                paddingHorizontal: 20,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ fontFamily: 'Poppins_500Medium', color: '#fff', fontSize: 16, marginRight: 6 }}>
                                                Ver local
                                            </Text>
                                            <Image source={require('../../../assets/img/icons/local-cidade.png')} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Caption fontSize={13} margintop={16} color={colors.neutralvariant60}>
                                    Localização indisponível para este estabelecimento.
                                </Caption>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </MainLayoutAutenticado>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalCard: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '88%',
        backgroundColor: colors.neutral99,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutralvariant90,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.neutralvariant90,
    },
    modalHeaderTitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 18,
        color: colors.neutral10,
    },
    modalMap: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 8,
        overflow: 'hidden',
    },
    introBox: {
        marginBottom: 20,
        padding: 16,
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: colors.primary90,
        borderWidth: 1,
        borderColor: colors.neutralvariant90,
    },
    couponTouchable: {
        marginBottom: 8,
    },
    couponCard: {
        backgroundColor: colors.neutral99,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primary90,
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    couponStripe: {
        width: 6,
        backgroundColor: colors.primary40,
    },
    couponInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        minHeight: 120,
    },
    logoWrap: {
        width: 72,
        height: 72,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.neutral90,
        borderWidth: 1,
        borderColor: colors.neutralvariant90,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    perforation: {
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lineDash: {
        width: 1,
        height: 88,
        borderLeftWidth: 1,
        borderColor: colors.primary80,
        opacity: 0.6,
    },
    couponTextBlock: {
        flex: 1,
        paddingLeft: 8,
        justifyContent: 'center',
    },
    nomeFantasia: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
        color: colors.neutral10,
        lineHeight: 20,
    },
    desconto: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 40,
        fontWeight: '600',
        color: colors.primary40,
        lineHeight: 48,
        marginTop: 4,
    },
    descontoLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: colors.neutralvariant60,
        marginTop: 2,
    },
})