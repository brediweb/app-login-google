import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import Caption from '../../components/typography/Caption'
import H5 from '../../components/typography/H5'
import H3 from '../../components/typography/H3'
import { colors } from '../../styles/colors'

function formatValor(valor: unknown) {
    if (valor == null) return 'Não informado'
    if (typeof valor === 'string' && valor.trim() === '') return 'Não informado'
    return String(valor)
}

function InfoLinha({
    label,
    valor,
}: {
    label: string
    valor: unknown
}) {
    return (
        <View style={styles.infoLinha}>
            <Caption fontSize={12} color={colors.neutralvariant60}>
                {label}
            </Caption>
            <Caption fontSize={15} margintop={4} color={colors.neutral10}>
                {formatValor(valor)}
            </Caption>
        </View>
    )
}

export default function DiscotokenQrCodeScreen() {
    const route = useRoute<any>()
    const cupom = route?.params?.cupom ?? {}
    const anunciante = cupom?.anunciante ?? {}
    const idAnunciante = anunciante?.user_id
    const idUsuario = route?.params?.usuarioCliente

    const idsValidos = idAnunciante != null && idUsuario != null
    const valorQrCode = `${idUsuario}`

    return (
        <MainLayoutAutenticado marginHorizontal={16}>
            <View style={styles.container}>
                <H5 color={colors.primary40}>QR Code Discontoken</H5>

                {idsValidos ? (
                    <>
                        <View style={styles.qrBox}>
                            <QRCode value={valorQrCode} size={220} />
                        </View>

                        <View style={styles.idsBox}>
                            <View style={styles.idColuna}>
                                <Caption fontSize={12} color={colors.neutralvariant60}>
                                    ID do Usuário para validar manualmente
                                </Caption>
                                <Text style={styles.idValor}>{String(idUsuario)}</Text>
                            </View>
                        </View>

                    </>
                ) : (
                    <View style={styles.avisoBox}>
                        <H3 align="center" color={colors.error30}>
                            Não foi possível gerar o QR Code: o ID do anunciante ou do usuário não está disponível.
                        </H3>
                    </View>
                )}

                <InfoLinha label="Nome fantasia" valor={anunciante?.nome_fantasia ?? cupom?.name} />
                {anunciante?.vantagem_porcentagem_discotoken != null && (
                    <InfoLinha label="Vantagem (%)" valor={`${anunciante?.vantagem_porcentagem_discotoken}%`} />
                )}
                {anunciante?.vantagem_reais_discotoken != null && (
                    <InfoLinha label="Vantagem (R$)" valor={`R$ ${anunciante?.vantagem_reais_discotoken}`} />
                )}
                <InfoLinha label="CNPJ" valor={anunciante?.cnpj} />
                <InfoLinha label="E-mail" valor={anunciante?.email ?? cupom?.email} />
                <InfoLinha label="Endereço" valor={anunciante?.endereco} />
                <InfoLinha
                    label="Cidade / Estado"
                    valor={`${formatValor(anunciante?.cidade ?? cupom?.cidade)} / ${formatValor(anunciante?.estado ?? cupom?.estado)}`}
                />
            </View>
        </MainLayoutAutenticado>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 72,
        paddingBottom: 24,
    },
    qrBox: {
        marginTop: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral99,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutralvariant90,
        paddingVertical: 20,
    },
    idsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.primary90,
        borderWidth: 1,
        borderColor: colors.neutralvariant90,
    },
    idColuna: {
        flex: 1,
        alignItems: 'center',
    },
    idDivisor: {
        width: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        marginHorizontal: 12,
        backgroundColor: colors.neutralvariant80,
    },
    idValor: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 22,
        color: colors.primary20,
        marginTop: 2,
    },
    codigoBox: {
        marginTop: 12,
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.primary80,
    },
    codigoValor: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        letterSpacing: 1,
        color: colors.neutral10,
        marginTop: 2,
    },
    avisoBox: {
        marginTop: 16,
        marginBottom: 8,
    },
    infoLinha: {
        marginTop: 10,
        paddingBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.neutralvariant90,
    },
})
