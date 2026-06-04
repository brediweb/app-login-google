import { format } from 'date-fns';
import { api } from '../../../service/api';
import { useEffect, useState } from 'react';
import IcoClose from '../../../svg/IcoClose';
import Toast from 'react-native-toast-message';
import { colors } from '../../../styles/colors';
import IcoAlerta from '../../../svg/IcoAlerta';
import H3 from '../../../components/typography/H3';
import H5 from '../../../components/typography/H5';
import { useNavigate } from '../../../hooks/useNavigate';
import ImagePicker from 'react-native-image-crop-picker';
import { check, request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { createNumberMask } from 'react-native-mask-input';
import InputArea from '../../../components/forms/InputArea';
import Caption from '../../../components/typography/Caption';
import RadioButton from '../../../components/forms/RadioButton';
import Paragrafo from '../../../components/typography/Paragrafo';
import FilledButton from '../../../components/buttons/FilledButton';
import InputOutlined from '../../../components/forms/InputOutlined';
import InputOutlinedMoney from '../../../components/forms/InputOutlinedMoney';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderPrimary from '../../../components/header/HeaderPrimary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RemoveCaracteres from '../../../components/forms/RemoveCaracteres';
import InputMascaraMoney from '../../../components/forms/InputMascaraMoney';
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado';
import InputMascaraPorcentagem from '../../../components/forms/InputMascaraPorcentagem';
import {
  Image,
  ImageBackground,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import { useGlobal } from '../../../context/GlobalContextProvider';
import { useIsFocused } from '@react-navigation/native';
import H2 from '@components/typography/H2';
import H1 from '@components/typography/H1';
import React from 'react';

export default function ClienteCriaCuponScreen() {
  const { navigate } = useNavigate();
  const isFocused = useIsFocused()
  const [titulo, setTitulo] = useState('');
  const [filial, setFilial] = useState('');
  const [loading, setLoading] = useState(true);
  const [descricao, setDescricao] = useState('');
  const [qtdCupons, setQtdCupons] = useState('');
  const [valorReais, setValorReais] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [codigoCupom, setCodigoCupom] = useState('');
  const [valorItem, setValorItem] = useState('');
  const [dadosUser, setDadosUser] = useState<any>({});
  const [resumoOferta, setResumoOferta] = useState('');
  const [tipoVantagem, setTipoVantagem] = useState('');
  const [valueVantagem, setValueVantagem] = useState('');
  const [imagemEnvio, setImagemEnvio] = useState<any>('');
  const [nextComAlerta, setNextComAlerta] = useState(false);
  const [modalCorretor, setModalCorretor] = useState(false);
  const [palavrasErradas, setPalavrasErradas] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [optionSelected, setOptionSelected] = useState<any>({});
  const [dataLimiteCriacao, setDataLimiteCriacao] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState<any>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [planActive, setPlanActive] = useState(false);

  const [errorTitulo, setErrorTitulo] = useState(false);
  const [errorResumo, setErrorResumo] = useState(false);
  const [errorImagem, setErrorImagem] = useState(false);
  const [errorDescricao, setErrorDescricao] = useState(false);
  const [errorQtdCupons, setErrorQtdCupons] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState(false);
  const [erroCodigoCupom, setErroCodigoCupom] = useState(false);
  const [errorValorItem, seterrorValorItem] = useState(false);
  const [errorDataValidade, setErrorDataValidade] = useState(false);
  const [errorTipoVantagem, setErrorTipoVantagem] = useState(false);
  const [errorValueVantagem, setErrorValueVantagem] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(false)

  const { update, setUpdate } = useGlobal();

  async function getPerfil() {
    try {
      const response = await api.get(`/perfil/pessoa-juridica/${dadosUser.id}`);
      setPlanActive(response.data.results.plano_ativo);
      setCategorias(response.data.results.perfil_id);
    } catch (error) {
      console.error('ERROR GET Categorias: ', error);
    }
    setLoading(false)
  }

  async function getDataLimite() {
    const jsonValue = await AsyncStorage.getItem('infos-user');
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        };
        const reponse = await api.get(`/verifica-data-limite`, { headers });
        setDataLimiteCriacao(reponse.data.results.validade);
      } catch (error: any) {
        console.error('ERROR GET Data Limite: ', error.response.data);
      }
    }
  }

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user');
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue);
        setDadosUser(newJson);
        getDataLimite();
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleTipoVantagem = (option: string) => {
    setTipoVantagem(option);
    if (option === 'Vantagem Porcentagem') {
      setValorReais('');
    } else if (option === 'Vantagem em Reais') {
      setValueVantagem('');
    }
  };

  const showDatePicker = () => {
    getDataLimite();
    // Se já existe uma data selecionada, usar ela, caso contrário usar a data atual
    if (dataSelecionada && dataSelecionada.length > 4) {
      setSelectedDate(new Date(dataSelecionada));
    } else {
      setSelectedDate(new Date());
    }
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisibility(false);
      if (event.type === 'set' && date) {
        setDataSelecionada(date.toISOString());
      }
    } else if (Platform.OS === 'ios') {
      // No iOS, atualiza o estado enquanto o usuário seleciona
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleConfirmIOS = () => {
    setDataSelecionada(selectedDate.toISOString());
    hideDatePicker();
  };

  function showPermissionDeniedAlert() {
    Alert.alert(
      'Permissão necessária',
      'Para enviar a imagem do anúncio é necessário permitir acesso à galeria ou câmera. Deseja abrir as configurações do app?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => openSettings() },
      ],
      { cancelable: false }
    );
  }

  async function requestGalleryPermissionAndOpen() {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          openGallery();
          return;
        }
        const requestStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (requestStatus === RESULTS.GRANTED || requestStatus === RESULTS.LIMITED) {
          openGallery();
        } else {
          showPermissionDeniedAlert();
        }
      } else {
        // Android 13+ (API 33+) usa Photo Picker do sistema (não requer permissão READ_MEDIA_IMAGES)
        // Android < 13 ainda precisa de READ_EXTERNAL_STORAGE
        if ((Platform.Version as number) >= 33) {
          // Android 13+: usar Photo Picker do sistema diretamente (sem solicitar permissão)
          openGallery();
        } else {
          // Android < 13: solicitar READ_EXTERNAL_STORAGE
          const status = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          if (status === RESULTS.GRANTED) {
            openGallery();
            return;
          }
          const requestStatus = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          if (requestStatus === RESULTS.GRANTED) {
            openGallery();
          } else {
            showPermissionDeniedAlert();
          }
        }
      }
    } catch (err) {
      console.warn('Erro permissão galeria:', err);
      Toast.show({ type: 'error', text1: 'Não foi possível acessar a galeria.' });
    }
  }

  async function requestCameraPermissionAndOpen() {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.CAMERA);
        if (status === RESULTS.GRANTED) {
          openCamera();
          return;
        }
        const requestStatus = await request(PERMISSIONS.IOS.CAMERA);
        if (requestStatus === RESULTS.GRANTED) {
          openCamera();
        } else if (requestStatus === RESULTS.BLOCKED) {
          showPermissionDeniedAlert();
        } else {
          showPermissionDeniedAlert();
        }
      } else {
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (hasPermission) {
          openCamera();
          return;
        }
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Acesso à câmera',
            message: 'O app precisa usar a câmera para tirar a foto do anúncio.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Negar',
          }
        );
        if (cameraPermission === PermissionsAndroid.RESULTS.GRANTED) {
          openCamera();
        } else {
          showPermissionDeniedAlert();
        }
      }
    } catch (err) {
      console.warn('Erro permissão câmera:', err);
      Toast.show({ type: 'error', text1: 'Não foi possível acessar a câmera.' });
    }
  }

  function openGallery() {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 1,
      mediaType: 'photo',
      cropperToolbarTitle: 'Editar foto',
      cropperChooseText: 'Usar',
      cropperCancelText: 'Cancelar',
    })
      .then((image: any) => {
        setImagemSelecionada(image.path);
        setImagemEnvio(image);
      })
      .catch((error: any) => {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: error?.message ?? 'Erro ao abrir a galeria.' });
        }
      });
  }

  function openCamera() {
    ImagePicker.openCamera({
      width: 500,
      height: 500,
      cropping: true,
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 1,
      mediaType: 'photo',
      cropperToolbarTitle: 'Editar foto',
      cropperChooseText: 'Usar',
      cropperCancelText: 'Cancelar',
    })
      .then((image: any) => {
        setImagemSelecionada(image.path);
        setImagemEnvio(image);
      })
      .catch((error: any) => {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: error?.message ?? 'Erro ao abrir a câmera.' });
        }
      });
  }

  function handlePickImage() {
    Alert.alert(
      'Upload da imagem',
      'Escolha de onde enviar a imagem',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: requestGalleryPermissionAndOpen },
        { text: 'Câmera', onPress: requestCameraPermissionAndOpen },
      ],
      { cancelable: true }
    );
  }

  async function validar() {
    const dataHoje = new Date();
    const dataEscolhida = new Date(dataSelecionada);

    getData();
    setErrorTitulo(false);
    setErrorDataValidade(false);
    setErrorResumo(false);
    setErrorDescricao(false);
    setErrorQtdCupons(false);
    setErrorTipoVantagem(false);
    setErrorValueVantagem(false);
    setErroCodigoCupom(false);
    seterrorValorItem(false);
    setErrorCategoria(false);
    setErrorImagem(false);

    if (titulo.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um título',
      });
      setErrorTitulo(true);
      return;
    }
    if (dataSelecionada.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma data de validade',
      });
      setErrorDataValidade(true);
      return;
    }
    if (dataEscolhida < dataHoje) {
      Toast.show({
        type: 'error',
        text1: 'Data de validade inválida',
      });
      setErrorDataValidade(true);
      return;
    }
    if (resumoOferta.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um resumo',
      });
      setErrorResumo(true);
      return;
    }
    if (descricao.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma descrição',
      });
      setErrorDescricao(true);
      return;
    }
    if (qtdCupons.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe quantidade de cupons',
      });
      setErrorQtdCupons(true);
      return;
    }
    if (!tipoVantagem) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma vantagem',
      });
      setErrorTipoVantagem(true);
      return;
    }
    if (valorReais.length <= 0 && valueVantagem.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe o valor da vantagem',
      });
      setErrorValueVantagem(true);
      return;
    }
    if (codigoCupom.length >= 1 && codigoCupom.length <= 9) {
      Toast.show({
        type: 'error',
        text1: 'Código deve ter 10 carecteres',
      });
      setErroCodigoCupom(true);
      return;
    }
    if (valorItem.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe o valor do item',
      });
      seterrorValorItem(true);
      return;
    }
    if (tipoVantagem === 'porcentagem' && parseFloat(valueVantagem) > 100) {
      Toast.show({
        type: 'error',
        text1: 'A porcentagem não pode ser maior que 100%',
      });
      setErrorValueVantagem(true);
      return;
    }
    const match = valorReais.match(/([\d,]+)/);
    const resultReais = match ? match[0] : '';

    const matchItem = valorItem.match(/([\d,]+)/);
    const resultItem = matchItem ? matchItem[0] : '';

    if (tipoVantagem === 'Vantagem em Reais' && parseFloat(resultReais) > parseFloat(resultItem)) {
      Alert.alert('O valor do desconto não pode ser maior que o valor do item');
      setErrorValueVantagem(true);
      return;
    }
    if (!optionSelected.categorias) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma categoria',
      });
      setErrorCategoria(true);
      return;
    }
    if (!imagemEnvio) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma imagem',
      });
      setErrorImagem(true);
      return;
    }
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${dadosUser.token}`,
        'Content-Type': 'multipart/form-data',
      };
      const response = await api.get(`/validacao-texto`, {
        params: {
          texto: `${descricao} ${codigoCupom} ${resumoOferta} ${titulo}`,
        },
        headers: headers,
      });

      if (response.data.vocabulario_incorreto && !nextComAlerta) {
        Toast.show({
          type: 'error',
          text1:
            response.data.message ??
            'Possui mensgem com vocabulário inrregular !',
        });
        setPalavrasErradas(response.data.results);
        setModalCorretor(true);
        setLoading(false);
        return;
      }

      const novoValorVantagem = RemoveCaracteres({ text: valueVantagem });

      const match = valorReais.match(/([\d,]+)/);
      const resultReais = match ? match[0] : '';

      const matchItem = valorItem.match(/([\d,]+)/);
      let resultItem = matchItem ? matchItem[0].replace(/,/g, '') : '';

      // Acrescenta zeros conforme o tamanho
      if (resultItem.length === 1) {
        resultItem += '000';
      } else if (resultItem.length === 2) {
        resultItem += '00';
      } else if (resultItem.length === 3) {
        resultItem += '0';
      }
      const resultItemNumber = Number(resultItem);

      const novaImage = {
        uri: imagemEnvio.path ?? '',
        type: 'image/.png',
        name: ' ',
      };
      const dataOriginal = new Date(dataSelecionada);
      const dataFormatada = format(dataOriginal, ' yyyy-MM-dd');


      setModalConfirmar(true)

    } catch (error: any) {
      console.error(error.response.data);
    }
    setLoading(false);
  }


  async function onSubmit() {
    const dataHoje = new Date();
    const dataEscolhida = new Date(dataSelecionada);

    getData();
    setErrorTitulo(false);
    setErrorDataValidade(false);
    setErrorResumo(false);
    setErrorDescricao(false);
    setErrorQtdCupons(false);
    setErrorTipoVantagem(false);
    setErrorValueVantagem(false);
    setErroCodigoCupom(false);
    seterrorValorItem(false);
    setErrorCategoria(false);
    setErrorImagem(false);

    if (titulo.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um título',
      });
      setErrorTitulo(true);
      return;
    }
    if (dataSelecionada.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma data de validade',
      });
      setErrorDataValidade(true);
      return;
    }
    if (dataEscolhida < dataHoje) {
      Toast.show({
        type: 'error',
        text1: 'Data de validade inválida',
      });
      setErrorDataValidade(true);
      return;
    }
    if (resumoOferta.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um resumo',
      });
      setErrorResumo(true);
      return;
    }
    if (descricao.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma descrição',
      });
      setErrorDescricao(true);
      return;
    }
    if (qtdCupons.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe quantidade de cupons',
      });
      setErrorQtdCupons(true);
      return;
    }
    if (!tipoVantagem) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma vantagem',
      });
      setErrorTipoVantagem(true);
      return;
    }
    if (valorReais.length <= 0 && valueVantagem.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe o valor da vantagem',
      });
      setErrorValueVantagem(true);
      return;
    }
    if (codigoCupom.length >= 1 && codigoCupom.length <= 9) {
      Toast.show({
        type: 'error',
        text1: 'Código deve ter 10 carecteres',
      });
      setErroCodigoCupom(true);
      return;
    }
    if (valorItem.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe o valor do item',
      });
      seterrorValorItem(true);
      return;
    }
    if (tipoVantagem === 'porcentagem' && parseFloat(valueVantagem) > 100) {
      Toast.show({
        type: 'error',
        text1: 'A porcentagem não pode ser maior que 100%',
      });
      setErrorValueVantagem(true);
      return;
    }
    const match = valorReais.match(/([\d,]+)/);
    const resultReais = match ? match[0] : '';

    const matchItem = valorItem.match(/([\d,]+)/);
    const resultItem = matchItem ? matchItem[0] : '';

    if (tipoVantagem === 'Vantagem em Reais' && parseFloat(resultReais) > parseFloat(resultItem)) {
      Alert.alert('O valor do desconto não pode ser maior que o valor do item');
      setErrorValueVantagem(true);
      return;
    }
    if (!optionSelected.categorias) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma categoria',
      });
      setErrorCategoria(true);
      return;
    }
    if (!imagemEnvio) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma imagem',
      });
      setErrorImagem(true);
      return;
    }
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${dadosUser.token}`,
        'Content-Type': 'multipart/form-data',
      };
      const response = await api.get(`/validacao-texto`, {
        params: {
          texto: `${descricao} ${codigoCupom} ${resumoOferta} ${titulo}`,
        },
        headers: headers,
      });

      if (response.data.vocabulario_incorreto && !nextComAlerta) {
        Toast.show({
          type: 'error',
          text1:
            response.data.message ??
            'Possui mensgem com vocabulário inrregular !',
        });
        setPalavrasErradas(response.data.results);
        setModalCorretor(true);
        setLoading(false);
        return;
      }

      const novoValorVantagem = RemoveCaracteres({ text: valueVantagem });

      const match = valorReais.match(/([\d,]+)/);
      const resultReais = match ? match[0] : '';

      const matchItem = valorItem.match(/([\d,]+)/);
      let resultItem = matchItem ? matchItem[0].replace(/,/g, '') : '';

      // Acrescenta zeros conforme o tamanho
      if (resultItem.length === 1) {
        resultItem += '000';
      } else if (resultItem.length === 2) {
        resultItem += '00';
      } else if (resultItem.length === 3) {
        resultItem += '0';
      }
      const resultItemNumber = Number(resultItem);

      const novaImage = {
        uri: imagemEnvio.path ?? '',
        type: 'image/.png',
        name: ' ',
      };
      const dataOriginal = new Date(dataSelecionada);
      const dataFormatada = format(dataOriginal, ' yyyy-MM-dd');

      const formdata = new FormData();
      const vantagemEnvio =
        tipoVantagem === 'Vantagem Porcentagem' ? 'porcentagem' : 'quantia';

      formdata.append('titulo_oferta', `${titulo}`);
      formdata.append('data_validade', `${dataFormatada}`);
      formdata.append('descricao_oferta', `${resumoOferta}`);
      formdata.append('descricao_completa', `${descricao}`);
      formdata.append('valor', `${resultItemNumber}`);
      formdata.append('codigo_cupom', `${codigoCupom}`);
      formdata.append('imagem_cupom', novaImage as any);
      formdata.append('quantidade_cupons', `${qtdCupons}`);
      formdata.append('categoria_cupom', `${optionSelected.categorias}`);
      formdata.append('id_categoria_cupom', `${optionSelected.id}`);
      if (vantagemEnvio === 'porcentagem') {
        formdata.append('vantagem_porcentagem', `${novoValorVantagem}`);
        formdata.append('vantagem_reais', '-');
      }
      if (vantagemEnvio === 'quantia') {
        formdata.append('vantagem_porcentagem', '-');
        formdata.append('vantagem_reais', `${resultReais}`);
      }

      try {
        const headers = {
          Authorization: `Bearer ${dadosUser.token}`,
          'Content-Type': 'multipart/form-data',
        };
        const response = await api.post(`/cupons/salva`, formdata, { headers });
        Toast.show({
          type: 'success',
          text1: 'Oferta criada com sucesso!',
        });
        setModalConfirmar(false)
        setValorReais('');
        setTitulo('');
        setFilial('');
        setDescricao('');
        setQtdCupons('');
        setCodigoCupom('');
        setResumoOferta('');
        setTipoVantagem('');
        setValueVantagem('');
        setOptionSelected('');
        setDataSelecionada('');
        setImagemSelecionada('');
        setDataLimiteCriacao('');
        setValorItem('');
        setNextComAlerta(false);
        setUpdate(update + 1);
        getPerfil()
        navigate('ClienteCupomSucessoScreen', { response });
      } catch (error: any) {
        setModalConfirmar(false)
        console.error('ERROR POST Cria Cupom: ', error?.response?.data?.message);
        Alert.alert(
          'Error', error?.response?.data?.message ??
        'Verifique sua conexão com a internet',
        )
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message ??
            'Verifique sua conexão com a internet',
        });
      }
    } catch (error: any) {
      console.error(error.response.data);
    }
    setLoading(false);
  }

  function closeEditarCupom() {
    setModalCorretor(false);
    setNextComAlerta(false);
  }

  function closeSubmitCupom() {
    setModalCorretor(false);
    setNextComAlerta(true);
    onSubmit();
  }

  useEffect(() => {
    getData();
    getPerfil();
  }, []);

  useEffect(() => {
    const onlyNumbers = valueVantagem.replace(/\D/g, '').slice(0, 2);
    if (onlyNumbers === '') {
      setValueVantagem('');
    } else {
      setValueVantagem(`${onlyNumbers}%`);
    }
  }, [valueVantagem]);

  useEffect(() => {
    getPerfil();
  }, [dadosUser]);

  useEffect(() => {
    if (isFocused) {
      getData();
      getPerfil();
    }
  }, [isFocused]);

  const realmask = createNumberMask({
    prefix: ['R', '$', ' '],
    delimiter: '.',
    separator: ',',
    precision: 2,
  });

  if (!planActive && !loading) {
    return (
      <MainLayoutAutenticado
        marginTop={0}
        marginHorizontal={0}
        loading={loading}
      >
        <View className='w-full mt-4' />
        <HeaderPrimary titulo="Criar anúncio" />
        <View className="mt-8 mx-7 pb-20">
          <View className="bg-white w-full rounded-xl">
            <View className="mt-8 px-4 mb-8 items-center">
              <H3 align={'center'}>Você não possui um plano ativo!</H3>
              <View className="mb-3" />
              <FilledButton
                title="Ver planos disponíveis"
                onPress={() => navigate('ClientePacotesScreen')}
              />
            </View>
          </View>
        </View>
      </MainLayoutAutenticado>
    );
  }

  return (
    <>
      <Modal visible={modalCorretor} transparent={true}>
        <View
          className="flex-1 w-full justify-center items-center"
          style={{ backgroundColor: 'rgba(52, 52, 52, 0.5)' }}
        >
          <View className="bg-white w-[90%] rounded-xl">
            <TouchableOpacity
              onPress={() => setModalCorretor(false)}
              className="absolute right-3 top-3"
            >
              <IcoClose />
            </TouchableOpacity>
            <View className="mt-8 px-4 mb-8 items-center">
              <IcoAlerta />
              <H3 align={'center'}>
                Texto com palavras que violam nossas políticas:
              </H3>
              <ScrollView className=" max-h-32">
                {palavrasErradas &&
                  palavrasErradas.map((item, index) => (
                    <View className="mt-2" key={index}>
                      <H5>
                        {' '}
                        {index + 1} - {item}
                      </H5>
                    </View>
                  ))}
              </ScrollView>
              <View className="mt-8 mb-2">
                <FilledButton
                  title="Continuar"
                  backgroundColor={colors.error40}
                  onPress={closeSubmitCupom}
                />
              </View>
              <FilledButton
                title="Voltar e editar"
                onPress={closeEditarCupom}
              />
            </View>
          </View>
        </View>
      </Modal>
      <MainLayoutAutenticado
        marginTop={0}
        marginHorizontal={0}
        loading={loading}
      >
        <Modal visible={modalConfirmar} transparent animationType='slide' className='flex-1 w-full h-full z-20'>
          <View className=' flex-1 justify-center items-center' style={{ backgroundColor: 'rgba(000, 000, 000, 0.5)' }}>
            <ScrollView
              className='w-[80%] px-4 bg-white rounded-xl py-12 my-12' style={{ borderColor: colors.secondary30, borderWidth: 2, }}>
              <Text
                className="mb-4 font-bold text-lg text-center"
                style={{ color: colors.error40 }}
              >
                Confirme as informações antes de cadastrar sua oferta:
              </Text>
              <InputOutlined
                value={titulo}
                error={errorTitulo}
                edicao={false}
                label="Título da oferta"
                keyboardType={'default'}
              />
              {dataSelecionada &&
                <InputOutlined
                  mt={10}
                  keyboardType={'default'}
                  edicao={false}
                  label='Data de Validade'
                  value={format(new Date(dataSelecionada), 'dd/MM/yyyy') ?? 'Data de validade'}
                />
              }
              <Text
                className="mb-1 mt-4 font-medium"
                style={{ color: errorTipoVantagem ? colors.error40 : '#49454F' }}
              >
                Detalhes resumida:
              </Text>
              <InputArea
                height={120}
                editable={false}
                error={errorResumo}
                value={resumoOferta}
                keyboardType={'default'}
                onChange={setResumoOferta}
                placeholder="Descrição resumida - Um resumo rapído e objetivo sobre a oferta"
              />
              <Text
                className="mb-1 mt-4 font-medium"
                style={{ color: errorTipoVantagem ? colors.error40 : '#49454F' }}
              >
                Detalhes da oferta:
              </Text>
              <InputArea
                height={180}
                value={descricao}
                editable={false}
                error={errorDescricao}
                keyboardType={'default'}
                onChange={setDescricao}
                placeholder="Detalhes da oferta - Mais longo e detalhado sobre caracteristicas do produto ou serviço, data de validade, condições de uso e outra informações relevantes"
              />
              <InputOutlined
                mt={12}
                maxLength={5}
                edicao={false}
                value={qtdCupons}
                error={errorQtdCupons}
                onChange={setQtdCupons}
                label="Quantidade de cupons"
                keyboardType={'number-pad'}
              />
              <View className="mt-4">
                <Text
                  className="mb-2 font-medium"
                  style={{ color: errorTipoVantagem ? colors.error40 : '#49454F' }}
                >
                  Vantagem selecionada:
                </Text>
                <RadioButton
                  options={['Vantagem Porcentagem', 'Vantagem em Reais']}
                  selectedOption={tipoVantagem}
                  desativar={true}
                  onSelectOption={handleTipoVantagem}
                />
              </View>
              {tipoVantagem === 'Vantagem Porcentagem' && (
                <InputOutlined
                  value={valueVantagem}
                  error={errorValueVantagem}
                  keyboardType={'number-pad'}

                  onChange={setValueVantagem}
                  label="Vantagem em porcentagem (%)"
                  edicao={false}
                  placeholder="Vantagem em porcentagem (%)"
                />
              )}
              {tipoVantagem === 'Vantagem em Reais' && (
                <InputOutlined
                  mt={12}
                  label="Vantagem em reais"
                  value={valorReais}
                  keyboardType={'number-pad'}
                  error={errorValueVantagem}
                  placeholder="Vantagem em reais (R$)"
                  edicao={false}
                />
              )}
              <InputOutlined
                mt={12}
                maxLength={10}
                value={codigoCupom}
                edicao={false}
                error={erroCodigoCupom}
                label="Código do Cupom"
                uppercase={'characters'}
                keyboardType={'default'}
                onChange={setCodigoCupom}
              />
              <InputOutlinedMoney
                mt={12}
                label="Valor do Item (R$)"
                value={valorItem}
                editable={false}
                error={errorValorItem}
                placeholder="Valor do Item (R$)"
              />
              <Text className="mt-4 mb-2 font-medium">
                Categoria selecionada:
              </Text>
              <View className="w-full flex justify-start items-center">
                {categorias &&
                  categorias.map((option: any) => (
                    <TouchableOpacity
                      key={option.id}
                    >
                      {option.id === optionSelected?.id &&
                        <View
                          className="flex-row items-center justify-center"
                        >
                          {option.title != '' ? (
                            <View className="mb-3">
                              {option.icon ? (
                                <View className="scale-75">{option.icon}</View>
                              ) : (
                                <Image
                                  className="w-12 h-12"
                                  source={{ uri: option.icone }}
                                />
                              )}
                            </View>
                          ) : option.icon ? (
                            <View className="scale-75">{option.icon}</View>
                          ) : (
                            <Image
                              className="w-12 h-12"
                              source={{ uri: option.icone }}
                            />
                          )}
                          {option.title != '' && (
                            <View className="absolute bottom-0">
                              <Paragrafo
                                color={'#2F009C'}
                                title={option.categorias}
                              />
                            </View>
                          )}
                        </View>
                      }
                    </TouchableOpacity>
                  ))}
              </View>

              <Text className="mb-2 font-medium mt-2">
                Imagem selecionada:
              </Text>
              {imagemSelecionada &&
                <TouchableOpacity
                  className="items-center w-full h-52 mx-auto mb-8"
                  style={{
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: colors.primary20,
                    backgroundColor: colors.primary90,
                  }}
                >
                  <Image
                    className="w-full h-52"
                    resizeMode="cover"
                    source={{ uri: imagemSelecionada }}
                  />
                </TouchableOpacity>
              }

              {loading ?
                <FilledButton color={colors.dark} backgroundColor={colors.tertiary} onPress={() => { }} title="Carregando..." />
                :
                <FilledButton onPress={onSubmit} title="Criar anúncio" />
              }
              <View className='w-full h-2' />
              <FilledButton onPress={() => setModalConfirmar(false)} title="Voltar" backgroundColor={colors.gray} />

              <View className='w-full h-28' />

            </ScrollView>
          </View>
        </Modal>
        <HeaderPrimary titulo="Criar anúncio" />

        <View className="mt-4 mx-7 pb-20">
          <InputOutlined
            value={titulo}
            error={errorTitulo}
            onChange={setTitulo}
            label="Título da oferta"
            keyboardType={'default'}
          />
          <InputOutlined
            mt={12}
            label="Filial"
            value={filial}
            onChange={setFilial}
            keyboardType={'default'}
          />
          {isDatePickerVisible && (
            <>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                maximumDate={dataLimiteCriacao ? new Date(dataLimiteCriacao) : undefined}
                onChange={handleDateChange}
                locale="pt-BR"
                style={Platform.OS === 'ios' ? { width: '100%', height: 200 } : undefined}
              />
              {Platform.OS === 'ios' && (
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#f7f7f7',
                  borderTopWidth: 1,
                  borderTopColor: '#ccc',
                }}>
                  <TouchableOpacity
                    onPress={hideDatePicker}
                    style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                  >
                    <Text style={{ fontSize: 16, color: '#666' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmIOS}
                    style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                  >
                    <Text style={{ fontSize: 16, color: colors.secondary40 || '#007AFF', fontWeight: '600' }}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
          {errorDataValidade ? (
            <TouchableOpacity
              onPress={showDatePicker}
              className="bg-white overflow-scroll border-solid border-[#f01] border-[1px] rounded-[4px] mt-5 mb-0 pb-0"
            >
              {dataSelecionada.length <= 4 ? (
                <Text className="text-[#49454F] text-[16px] my-4 ml-4">
                  Data de validade
                </Text>
              ) : (
                <Text className="text-[#49454F] text-[16px] my-4 ml-4">
                  {format(new Date(dataSelecionada), 'dd/MM/yyyy') ??
                    'Data de validade'}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={showDatePicker}
              className="bg-white overflow-scroll border-solid border-[#49454F] border-[1px] rounded-[4px] mt-5 mb-0 pb-0"
            >
              {dataSelecionada.length <= 4 ? (
                <Text className="text-[#49454F] text-[16px] my-4 ml-4">
                  Data de validade
                </Text>
              ) : (
                <Text className="text-[#49454F] text-[16px] my-4 ml-4">
                  {format(new Date(dataSelecionada), 'dd/MM/yyyy') ??
                    'Data de validade'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <InputArea
            mt={12}
            height={120}
            error={errorResumo}
            value={resumoOferta}
            keyboardType={'default'}
            onChange={setResumoOferta}
            placeholder="Descrição resumida - Um resumo rapído e objetivo sobre a oferta"
          />

          <InputArea
            mt={12}
            height={180}
            value={descricao}
            error={errorDescricao}
            keyboardType={'default'}
            onChange={setDescricao}
            placeholder="Detalhes da oferta - Mais longo e detalhado sobre caracteristicas do produto ou serviço, data de validade, condições de uso e outra informações relevantes"
          />

          <InputOutlined
            mt={12}
            maxLength={5}
            value={qtdCupons}
            error={errorQtdCupons}
            onChange={setQtdCupons}
            label="Quantidade de cupons"
            keyboardType={'number-pad'}
          />
          <View className="mt-4">
            <Text
              className="mb-2 font-medium"
              style={{ color: errorTipoVantagem ? colors.error40 : '#49454F' }}
            >
              Selecione um tipo de vantagem:
            </Text>
            <RadioButton
              options={['Vantagem Porcentagem', 'Vantagem em Reais']}
              selectedOption={tipoVantagem}
              onSelectOption={handleTipoVantagem}
            />
          </View>
          {tipoVantagem === 'Vantagem Porcentagem' && (
            <InputOutlined
              value={valueVantagem}
              error={errorValueVantagem}
              keyboardType={'number-pad'}
              clearInput={() => setValueVantagem('')}
              onChange={setValueVantagem}
              height={50}
              label="Vantagem em porcentagem (%)"
              placeholder="Vantagem em porcentagem (%)"
            />
          )}
          {tipoVantagem === 'Vantagem em Reais' && (
            <InputOutlinedMoney
              label=""
              height={50}
              value={valorReais}
              clearInput={() => setValorReais('')}
              error={errorValueVantagem}
              placeholder="Vantagem em reais (R$)"
              onChange={setValorReais}
            />
          )}

          <InputOutlined
            mt={12}
            maxLength={10}
            value={codigoCupom}
            error={erroCodigoCupom}
            label="Código do Cupom"
            uppercase={'characters'}
            keyboardType={'default'}
            onChange={setCodigoCupom}
          />

          <InputOutlinedMoney
            mt={12}
            height={50}
            value={valorItem}
            error={errorValorItem}
            clearInput={() => setValorItem('')}
            onChange={setValorItem}
            placeholder="Valor do Item (R$)"
          />

          <Text className="mt-4 mb-2 font-medium">
            Selecione uma categoria:
          </Text>
          <View className="w-full flex-wrap  flex-row justify-start flex gap-1 mb-2">
            {categorias &&
              categorias.map((option: any) => (
                <TouchableOpacity
                  key={option.id}
                  className="w-[25vw] h-[25vw]"
                  onPress={() => setOptionSelected(option)}
                >
                  {option.id === optionSelected?.id ? (
                    <ImageBackground
                      className="flex-1 items-center justify-center"
                      resizeMode="contain"
                      source={require('../../../../assets/img/bg/bg-radio-button-selectd.png')}
                    >
                      {option.title != '' ? (
                        <View className="mb-3">
                          {option.icon ? (
                            <View className="scale-75">{option.icon}</View>
                          ) : (
                            <Image
                              className="w-12 h-12"
                              source={{ uri: option.icone }}
                            />
                          )}
                        </View>
                      ) : option.icon ? (
                        <View className="scale-75">{option.icon}</View>
                      ) : (
                        <Image
                          className="w-12 h-12"
                          source={{ uri: option.icone }}
                        />
                      )}
                      {option.title != '' && (
                        <View className="absolute bottom-2">
                          <Paragrafo
                            color={'#2F009C'}
                            title={option.categorias}
                          />
                        </View>
                      )}
                    </ImageBackground>
                  ) : (
                    <ImageBackground
                      className="flex-1 items-center justify-center"
                      resizeMode="contain"
                      source={require('../../../../assets/img/bg/bg-radio-button.png')}
                    >
                      {option.title != '' ? (
                        <View className="mb-3">
                          {option.icon ? (
                            <View className="scale-75">{option.icon}</View>
                          ) : (
                            <Image
                              className="w-12 h-12"
                              source={{ uri: option.icone }}
                            />
                          )}
                        </View>
                      ) : option.icon ? (
                        <View className="scale-75">{option.icon}</View>
                      ) : (
                        <Image
                          className="w-12 h-12"
                          source={{ uri: option.icone }}
                        />
                      )}
                      {option.title != '' && (
                        <View className="absolute bottom-2">
                          <Paragrafo
                            color={'#2F009C'}
                            title={option.categorias}
                          />
                        </View>
                      )}
                    </ImageBackground>
                  )}
                </TouchableOpacity>
              ))}
          </View>

          {imagemSelecionada ? (
            <TouchableOpacity
              onPress={handlePickImage}
              className="items-center mt-4 mb-4 w-full h-52 mx-auto"
              style={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: colors.primary20,
                backgroundColor: colors.primary90,
              }}
            >
              <Image
                className="w-full h-52"
                resizeMode="cover"
                source={{ uri: imagemSelecionada }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              className="items-center p-7 mt-4 mb-4"
              style={{
                backgroundColor: colors.primary90,
                borderColor: colors.primary20,
                borderWidth: 2,
                borderStyle: 'dashed',
              }}
            >
              <Image
                className="mb-2"
                source={require('../../../../assets/img/icons/file-upload.png')}
              />

              <Caption
                fontSize={16}
                align={'center'}
                fontWeight={'500'}
                color={colors.primary20}
              >
                Clique aqui para fazer o upload da foto do produto, recomendamos
                que seja uma Largura: 300px e Altura: 200px
              </Caption>
            </TouchableOpacity>
          )}

          <FilledButton onPress={validar} title="Revisar anúncio" />
        </View>
      </MainLayoutAutenticado>
    </>
  );
}
