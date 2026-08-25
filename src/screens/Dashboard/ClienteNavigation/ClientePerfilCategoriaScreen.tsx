import { api } from '../../../service/api';
import Toast from 'react-native-toast-message';
import React, { useEffect, useState } from 'react';
import { useNavigate } from '../../../hooks/useNavigate';
import LinearGradient from 'react-native-linear-gradient';
import ButtonPerfil from '../../../components/buttons/ButtonPerfil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado';
import {
  View,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  Text,
} from 'react-native';
import ButtonOutline from '@components/buttons/ButtonOutline';

/** Normaliza vários formatos comuns de resposta da API de categorias. */
function normalizarListaCategoriasApi(data: any): any[] {
  if (data == null) return []
  const raw = data?.results ?? data?.data ?? data
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.categorias)) return raw.categorias
    if (Array.isArray(raw.results)) return raw.results
    if (Array.isArray(raw.items)) return raw.items
  }
  return []
}

/** Extrai ids da resposta de categorias já escolhidas pelo anunciante. */
function extrairIdsSelecionadas(data: any): any[] {
  const root = data?.results ?? data?.data ?? data
  let arr: any[] = []
  if (Array.isArray(root)) {
    arr = root
  } else if (root && Array.isArray(root.categorias)) {
    arr = root.categorias
  } else if (root && Array.isArray(root.ids)) {
    arr = root.ids
  }
  return arr
    .map((cat: any) => {
      if (typeof cat === 'number' || typeof cat === 'string') return cat
      if (cat?.categoria_id != null) return cat.categoria_id
      if (cat?.id != null) return cat.id
      return null
    })
    .filter((id: any) => id != null)
}

function idsIguais(a: any, b: any): boolean {
  return String(a) === String(b)
}

export default function ClientePerfilCategoriaScreen() {
  const { navigate } = useNavigate();
  const screenWidth = Dimensions.get('window').width;
  const numCols = screenWidth > 375 ? 3 : 2;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listaCategorias, setListaCategorias] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [originalSelectedOptions, setOriginalSelectedOptions] = useState<any[]>(
    [],
  );
  const [needSave, setNeedSave] = useState(false);

  const handleSelectOption = (option: any) => {
    let updatedOptions: any[];
    if (selectedOptions.some((o) => idsIguais(o, option))) {
      updatedOptions = selectedOptions.filter((o) => !idsIguais(o, option));
    } else {
      if (selectedOptions.length < 3) {
        updatedOptions = [...selectedOptions, option];
      } else {
        Toast.show({
          type: 'error',
          text1: 'O limite máximo é 3 perfis !',
        });
        return;
      }
    }
    setSelectedOptions(updatedOptions);
  };

  /**
   * Catálogo completo para escolha de perfil: `/categorias/cadastro` (igual ao
   * cadastro em RadioSimples). Se vier vazio ou falhar, usa `/categorias` como na Home.
   */
  async function getCategorias() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (!jsonValue) {
      setListaCategorias([])
      return
    }
    const newJson = JSON.parse(jsonValue)
    const headers = { Authorization: `Bearer ${newJson.token}` }
    try {
      const resCadastro = await api.get('/categorias/cadastro', { headers })
      let list = normalizarListaCategoriasApi(resCadastro.data)
      if (list.length === 0) {
        const resHome = await api.get('/categorias', { headers })
        list = normalizarListaCategoriasApi(resHome.data)
      }
      setListaCategorias(list)
    } catch (error: any) {
      console.error('Erro ao buscar categorias (cadastro), tentando /categorias', error.response?.data)
      try {
        const response = await api.get('/categorias', { headers })
        setListaCategorias(normalizarListaCategoriasApi(response.data))
      } catch (e2: any) {
        console.error('Erro ao buscar /categorias', e2.response?.data)
        setListaCategorias([])
      }
    }
  }

  /** Apenas os ids que o anunciante já marcou. */
  async function getCategoriasSelecionadas() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (!jsonValue) return
    const newJson = JSON.parse(jsonValue)
    try {
      const response = await api.get('/anunciante/categorias-selecionadas', {
        headers: { Authorization: `Bearer ${newJson.token}` },
      })
      const idsSelecionados = extrairIdsSelecionadas(response.data)
      setSelectedOptions(idsSelecionados)
      setOriginalSelectedOptions(idsSelecionados)
    } catch (error: any) {
      console.error(
        'Erro ao buscar categorias selecionadas',
        error.response?.data || error.message,
      )
      setSelectedOptions([])
      setOriginalSelectedOptions([])
    }
  }

  async function savePerfil() {
    const jsonValue = await AsyncStorage.getItem('infos-user');
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        };
        const response = await api.post(
          '/atualiza-categorias',
          { categorias: selectedOptions },
          { headers }
        );
        navigate('ClientePerfilScreen')
        Toast.show({
          type: 'success',
          text1: 'Categorias atualizadas!',
        });
        setNeedSave(false);
        getPerfil();
        getCategoriasSelecionadas();
      } catch (error: any) {
        console.error('ERROR POST Atualizar Categorias', error.response.data);
      }
    }
  }

  async function getPerfil() {
    const jsonValue = await AsyncStorage.getItem('infos-user');
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);
      try {
        const response = await api.get(`/perfil/pessoa-juridica/${newJson.id}`);
        const perfil = response.data.results.perfil_id || [];

        const idsSelecionados = perfil
          .map((categoria: any) => {
            if (typeof categoria === 'number' || typeof categoria === 'string') {
              return categoria;
            }
            if (categoria?.categoria_id != null) {
              return categoria.categoria_id;
            }
            if (categoria?.id != null) {
              return categoria.id;
            }
            return null;
          })
          .filter((id: any) => id != null);

        // A população de selectedOptions e originalSelectedOptions
        // agora é feita pelo método getCategoriasSelecionadas
        // setSelectedOptions(idsSelecionados);
        // setOriginalSelectedOptions(idsSelecionados);
      } catch (error: any) {
        console.error('Error GET Perfil: ', error.response.data);
      }
    }
  }

  const renderItemSegundo = ({ item }: any) => {
    const isSelected = selectedOptions.some((id: any) => idsIguais(id, item.id))

    return (
      <View style={[styles.container, { width: `${100 / numCols}%` }]}>
        <View style={styles.column}></View>
        <LinearGradient
          style={[
            styles.block,
            isSelected && {
              borderColor: '#4F46E5',
              borderWidth: 3,
              transform: [{ scale: 1.03 }],
              shadowColor: '#4F46E5',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1.2 }}
          colors={[
            isSelected ? '#EEF2FF' : '#775AFF',
            isSelected ? '#E0E7FF' : '#B2C5FF',
          ]}
        >
          <TouchableOpacity
            className="flex-1 items-center justify-center px-2"
            onPress={() => handleSelectOption(item.id)}
          >
            {isSelected && (
              <View className="absolute top-1 right-4 px-2 py-[2px] rounded-full bg-[#4F46E5]">
                <Text className="text-[10px] font-semibold text-white">
                  Selecionado
                </Text>
              </View>
            )}
            <View className="items-center justify-center">
              {item.icon ? (
                item.icon
              ) : (
                <Image className="w-12 h-12 mb-2" source={{ uri: item.icone }} />
              )}
              {item.categorias !== '' && (
                <Text
                  className="text-[11px] font-medium text-center"
                  style={{ color: isSelected ? '#111827' : '#2F009C' }}
                  numberOfLines={2}
                >
                  {item.categorias}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getPerfil();
      await getCategorias();
      await getCategoriasSelecionadas();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    getPerfil();
    getCategorias();
    getCategoriasSelecionadas()
  }, []);

  useEffect(() => {
    const atual = [...selectedOptions].sort((a, b) => a - b);
    const original = [...originalSelectedOptions].sort((a, b) => a - b);
    setNeedSave(JSON.stringify(atual) !== JSON.stringify(original));
  }, [selectedOptions, originalSelectedOptions]);

  const lista = Array.isArray(listaCategorias) ? listaCategorias : [];

  const categoriasSelecionadasNomes = lista
    .filter((cat: any) =>
      selectedOptions.some((id: any) => idsIguais(id, cat.id)),
    )
    .map((cat: any) => cat.categorias);

  const categoriasOriginaisNomes = lista
    .filter((cat: any) =>
      originalSelectedOptions.some((id: any) => idsIguais(id, cat.id)),
    )
    .map((cat: any) => cat.categorias);

  return (
    <MainLayoutAutenticado notScroll marginTop={20}>
      <ButtonPerfil
        mt={64}
        fontsize={24}
        title="Perfil - Categorias"
        onPress={() => { }}
        image={
          needSave
            ? require('../../../../assets/img/icons/save.png')
            : require('../../../../assets/img/icons/save-mark.png')
        }
      />

      <View className="mt-4 px-4">
        {categoriasOriginaisNomes.length > 0 && (
          <View className="mb-3">
            <Text className="text-xs font-semibold text-[#6B7280]">
              Categorias já salvas
            </Text>
            <View className="flex-row flex-wrap mt-1">
              {categoriasOriginaisNomes.map((nome: string, index: number) => (
                <View
                  key={`orig-${nome}-${index}`}
                  className="px-3 py-1 mr-2 mb-2 rounded-full bg-[#E5E7EB]"
                >
                  <Text className="text-xs font-medium text-[#374151]">
                    {nome}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text className="text-sm font-semibold text-[#111827]">
          Categorias selecionadas agora ({selectedOptions.length}/3)
        </Text>
        {categoriasSelecionadasNomes.length > 0 ? (
          <View className="flex-row flex-wrap mt-2">
            {categoriasSelecionadasNomes.map((nome: string, index: number) => (
              <View
                key={`${nome}-${index}`}
                className="px-3 py-1 mr-2 mb-2 rounded-full bg-[#EEF2FF]"
              >
                <Text className="text-xs font-medium text-[#3730A3]">
                  {nome}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-xs text-[#6B7280] mt-1">
            Nenhuma categoria selecionada ainda. Toque em uma categoria abaixo para escolher.
          </Text>
        )}
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => String(item?.id ?? item?.categoria_id)}
        renderItem={renderItemSegundo}
        numColumns={numCols}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 8 }}
        ListFooterComponent={
          <View className="mt-4 mb-8 px-4">
            <ButtonOutline
              title="Atualizar categorias"
              onPress={savePerfil}
              disabled={!needSave}
            />
          </View>
        }
      />

    </MainLayoutAutenticado>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  block: {
    height: 140,
    width: '100%',
    borderRadius: 14,
    marginVertical: 6,
    backgroundColor: 'blue',
  },
});
