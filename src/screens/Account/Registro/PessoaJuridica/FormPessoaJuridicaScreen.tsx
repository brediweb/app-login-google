import axios from 'axios';
import Toast from 'react-native-toast-message';
import { colors } from '../../../../styles/colors';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import ImagePicker from 'react-native-image-crop-picker';
import React, { useEffect, useRef, useState } from 'react';
import { check, request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useNavigate } from '../../../../hooks/useNavigate';
import { api, api_cnpj, api_ibge } from '../../../../service/api';
import Geolocation from '@react-native-community/geolocation';
import Caption from '../../../../components/typography/Caption';
import ValidarCPF from '../../../../components/forms/ValidarCPF';
import ValidarCNPJ from '../../../../components/forms/ValidarCNPJ';
import ValidarEmail from '../../../../components/forms/ValidarEmail';
import FilledButton from '../../../../components/buttons/FilledButton';
import ModalTemplate from '../../../../components/Modals/ModalTemplate';
import HeaderPrimary from '../../../../components/header/HeaderPrimary';
import RemoveCaracteres from '../../../../components/forms/RemoveCaracteres';
import MainLayoutSecondary from '../../../../components/layout/MainLayoutSecondary';
import {
  LocationAccuracy,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from 'expo-location';
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  Text,
  Alert,
  PermissionsAndroid,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import InputOutlinedCadastro from '@components/forms/InputOutlinedCadastro';
import InputOutlined from '@components/forms/InputOutlined';
import LogoUpload from '@components/LogoUpload';
import Spacing from '@components/layout/Spacing';

interface ILocalizacao {
  latitude: number;
  longitude: number;
}

function coordenadasValidas(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/** Prioridade: ponto escolhido no mapa → região (ex.: CEP) → GPS */
function coordenadasParaSalvar(
  nova: ILocalizacao,
  regiao: { latitude: number; longitude: number } | null,
  loc: { latitude: number; longitude: number } | null
): { latitude: number; longitude: number } | null {
  if (coordenadasValidas(nova.latitude, nova.longitude)) {
    return { latitude: nova.latitude, longitude: nova.longitude };
  }
  if (regiao && coordenadasValidas(regiao.latitude, regiao.longitude)) {
    return { latitude: regiao.latitude, longitude: regiao.longitude };
  }
  if (loc && coordenadasValidas(loc.latitude, loc.longitude)) {
    return { latitude: loc.latitude, longitude: loc.longitude };
  }
  return null;
}

export default function FormPessoaJuridicaScreen({
  navigation,
}: {
  navigation: any;
}) {
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const input4Ref = useRef(null);
  const input5Ref = useRef(null);
  const input6Ref = useRef(null);
  const input7Ref = useRef(null);
  const input8Ref = useRef(null);
  const input9Ref = useRef(null);
  const input10Ref = useRef(null);
  const input11Ref = useRef(null);
  const input12Ref = useRef(null);
  const { navigate } = useNavigate();
  const [cnpj, setCnpj] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState('');
  const [imagemEnvio, setImagemEnvio] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [listaEstados, setListaEstados] = useState<any>([]);
  const [listaCidades, setListaCidades] = useState<any>([]);
  const [cpfRepresetante, setCpfRepresetante] = useState('');
  const [nomeRepresetante, setNomeRepresetante] = useState('');
  const [nomeEmpressarial, setNomeEmpressarial] = useState('');
  const [regiao, setRegiao] = useState<any>(null);
  const [localizacao, setLocalizacao] = useState<any>(null);
  const [modalUf, setModalUf] = useState(false);
  const [modalCidade, setModalCidade] = useState(false);
  const [novaLocalizacao, setNovaLocalizacao] = useState<ILocalizacao>({
    latitude: 0,
    longitude: 0,
  });
  // STATUS ERROR DOS CAMPOS
  const [errorCep, setErrorCep] = useState(false);
  const [errorCnpj, setErrorCnpj] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorSenha, setErrorSenha] = useState(false);
  const [errorCidade, setErrorCidade] = useState(false);
  const [errorEstado, setErrorEstado] = useState(false);
  const [erroChecked, setErroChecked] = useState(false);
  const [errorTelefone, setErrorTelefone] = useState(false);
  const [errorEndereco, setErrorEndereco] = useState(false);
  const [errorNomeFantasia, setErrorNomeFantasia] = useState(false);
  const [errorConfirmarSenha, setErrorConfirmarSenha] = useState(false);
  const [errorCpfRepresetante, setErrorCpfRepresetante] = useState(false);
  const [errorNomeRepresetante, setErrorNomeRepresetante] = useState(false);
  const [errorNomeEmpressarial, setErrorNomeEmpressarial] = useState(false);
  const [permissionGrantedIos, setPermissionGrantedIos] = useState(false);
  const [errorLocalizacao, setErrorLocalizacao] = useState('');
  const [modalLocalizacao, setModalLocalizacao] = useState(false);
  const [modalAviso, setModalAviso] = useState(false);
  const [codigoAfiliado, setCodigoAfiliado] = useState('');

  async function validaCampos() {
    setModalAviso(false);
    setModalLocalizacao(false);

    // if (novaLocalizacao?.latitude === 0 || novaLocalizacao?.longitude === 0) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Selecione a localização do seu estabelecimento',
    //   });
    //   return;
    // }

    const cnpjValido = ValidarCNPJ({ cnpj: cnpj });
    // const emailValido = ValidarEmail({ email: email });
    const cpfValido = ValidarCPF({ cpf: cpfRepresetante });

    setErrorCep(false);
    setErrorCnpj(false);
    setErrorEmail(false);
    setErrorSenha(false);
    setErrorCidade(false);
    setErrorEstado(false);
    setErrorTelefone(false);
    setErrorEndereco(false);
    setErrorNomeFantasia(false);
    setErrorConfirmarSenha(false);
    setErrorCpfRepresetante(false);
    setErrorNomeRepresetante(false);
    setErrorNomeEmpressarial(false);

    if (nomeFantasia?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Nome fantasia válido !',
      });
      setErrorNomeFantasia(true);
      return;
    } else if (nomeEmpressarial?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Nome empresarial válido !',
      });
      setErrorNomeEmpressarial(true);
      return;
    } else if (cnpj?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'O campo CNPJ é obrigatório !',
      });
      setErrorCnpj(true);
      return;
    } else if (!cnpjValido) {
      Toast.show({
        type: 'error',
        text1: 'Informe um CNPJ válido !',
      });
      setErrorCnpj(true);
      return;
    } else if (endereco?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Endereço válido !',
      });
      setErrorEndereco(true);
      return;
    } else if (email?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'O campo e-mail é obrigatório !',
      });
      setErrorEmail(true);
      return;
    } else if (telefone?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Telefone válido !',
      });
      setErrorTelefone(true);
      return;
    } else if (cep?.length <= 0 || cep?.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Informe um CEP válido !',
      });
      setErrorTelefone(true);
      return;
    } else if (!estado) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Estado !',
      });
      setErrorTelefone(true);
      return;
    } else if (!cidade) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma cidade !',
      });
      setErrorTelefone(true);
      return;
    } else if (nomeRepresetante?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Nome represetante da empresa válido !',
      });
      setErrorNomeRepresetante(true);
      return;
    } else if (cpfRepresetante?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'O campo CPF do represetante é obrigatório !',
      });
      setErrorCpfRepresetante(true);
      return;
    } else if (!cpfValido) {
      Toast.show({
        type: 'error',
        text1: 'Informe um CPF do represetante da empresa válido !',
      });
      setErrorCpfRepresetante(true);
      return;
    } else if (senha?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma Senha válida !',
      });
      setErrorSenha(true);
      return;
    } else if (senha?.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'A senha deve ter 8 caracteres !',
      });
      setErrorSenha(true);
      return;
    } else if (confirmarSenha?.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe o confirmar senha válido !',
      });
      setErrorConfirmarSenha(true);
      return;
    } else if (senha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Senhas diferentes !',
      });
      setErrorSenha(true);
      setErrorConfirmarSenha(true);
      return;
    } else if (checked === false) {
      Toast.show({
        type: 'error',
        text1: 'Aceite os Termos e Condições',
      });
      return;
    }

    const formData = {
      cnpj: cnpj.replace(/\D/g, ''),
      email: email,
      cpf: cpfRepresetante.replace(/\D/g, ''),
    }

    setLoading(true);
    try {
      const response = await api.post(`/cadastro/valida-campos`, formData);
      const data = response?.data ?? {};
      const results = data?.results ?? {};

      if (results?.cnpjusado) {
        Toast.show({ type: 'error', text1: 'CNPJ já cadastrado!' });
        setErrorCnpj(true);
        return;
      }
      if (results?.emailusado) {
        Toast.show({ type: 'error', text1: 'E-mail já cadastrado!' });
        setErrorEmail(true);
        return;
      }

      // CPF já cadastrado é ignorado – permite seguir com o cadastro
      setModalLocalizacao(true);

    } catch (error: any) {
      const data = error?.response?.data ?? {};
      const results = data?.results ?? {};
      const message = data?.message ?? 'Não foi possível validar os dados.';


      if (results?.emailusado) {
        Toast.show({ type: 'error', text1: 'E-mail já cadastrado!' });
        setErrorEmail(true);
        return;
      }
      // CPF já cadastrado é ignorado – permite seguir com o cadastro
      setModalLocalizacao(true);
    } finally {
      setLoading(false);
    }
  }

  async function postPessoaJuridica() {
    setModalAviso(false)
    setModalLocalizacao(false)

    const coordsFinal = coordenadasParaSalvar(
      novaLocalizacao,
      regiao,
      localizacao
    );
    if (!coordsFinal) {
      Toast.show({
        type: 'error',
        text1: 'Selecione a localização do seu estabelecimento no mapa.',
      });
      setModalLocalizacao(true);
      return;
    }

    const novoCnpj = RemoveCaracteres({ text: cnpj });
    const novoTelefone = RemoveCaracteres({ text: telefone });
    const novoCpf = RemoveCaracteres({ text: cpfRepresetante });
    const novoCep = RemoveCaracteres({ text: cep });

    const dataForm = {
      nome_fantasia: nomeFantasia,
      nome_empresarial: nomeEmpressarial,
      cnpj: novoCnpj,
      endereco: endereco,
      email: email,
      telefone: novoTelefone,
      nome_represetante: nomeRepresetante,
      cpf_represetante: novoCpf,
      senha: senha,
      rua: rua,
      bairro: bairro,
      numero: numero,
      latitude: String(coordsFinal.latitude),
      longitude: String(coordsFinal.longitude),
      logomarca: imagemEnvio,
      cep: novoCep,
      cidade: cidade,
      estado: estado,
      codigo_afiliado: codigoAfiliado,
    };

    navigate('FormPerfilScreen', dataForm);
  }

  const handleCNPJMask = (value: any) => {
    let cnpj = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{2})$/, '$1-$2');
    setCnpj(cnpj);
  };

  const handleCPFMask = (value: any) => {
    let cpf = value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{2})$/, '$1-$2');
    setCpfRepresetante(cpf);
  };

  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
    setTelefone(phone);
  };

  // const handleCEPChange = (text: string) => {
  //   const cleanedText = text.replace(/\D/g, '');

  //   let formattedCEP = cleanedText;
  //   if (cleanedText.length > 5) {
  //     formattedCEP = `${cleanedText.slice(0, 5)}-${cleanedText.slice(5, 8)}`;
  //   }

  //   setCep(formattedCEP);
  // };

  async function handleCep() {
    const newCep = cep.replace(/\D/g, '');
    getCEP(newCep);
  };

  async function getCEP(novoCep: any) {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://brasilapi.com.br/api/cep/v2/${novoCep}`
      );
      setEndereco(response.data.street);
      setCidade(response.data.city);
      setEstado(response.data.state);
      setUf(response.data.state);
      setRua(response.data.street);
      setBairro(response.data.neighborhood);
      const lat = parseFloat(response.data.location.coordinates.latitude);
      const lng = parseFloat(response.data.location.coordinates.longitude);
      if (coordenadasValidas(lat, lng)) {
        setNovaLocalizacao({ latitude: lat, longitude: lng });
      }
      // console.log('teste', {
      //   latitude: parseFloat(response.data.location.coordinates.latitude),
      //   longitude: parseFloat(response.data.location.coordinates.longitude),
      // });
    } catch (error: any) {
      console.error('Error GET CEP', error);
      setEndereco('');
      setCidade('');
      setEstado('');
      setUf('');
      setRua('');
      setBairro('');
    }
    setLoading(false)
  }

  const handleCheckboxPress = () => {
    setChecked(!checked);
  };

  const focusNextInput = (nextInputRef: any) => {
    if (nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  function showPermissionDeniedAlert() {
    Alert.alert(
      'Permissão necessária',
      'Para enviar a logomarca é necessário permitir acesso à galeria ou câmera. Deseja abrir as configurações do app?',
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
            message: 'O app precisa usar a câmera para tirar a foto da logomarca.',
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
      cropperCircleOverlay: true,
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
      cropperCircleOverlay: true,
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
      'Upload da logomarca',
      'Escolha de onde enviar a imagem',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: requestGalleryPermissionAndOpen },
        { text: 'Câmera', onPress: requestCameraPermissionAndOpen },
      ],
      { cancelable: true }
    );
  }

  function getLocalizacao() {
    Geolocation.getCurrentPosition(
      (info) => {
        setLocalizacao({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        });
      },
      (error) => {
        if (error.code === 3) {
          console.warn('Localização: timeout. Tente em área com melhor sinal.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 15000,
      }
    );
  }

  async function getPermissionIOS() {
    try {
      const { granted } = await requestForegroundPermissionsAsync();
      setPermissionGrantedIos(granted);
    } catch (error: any) {
      console.error('ERRO Permissão IOS:', error);
    }
  }

  async function getCNPJ() {
    const novoCnpj = RemoveCaracteres({ text: cnpj });
    setLoading(true);
    try {
      const response = await api_cnpj.get(`/${novoCnpj}`);
      // console.log(response.data);
      setNomeFantasia(response.data.estabelecimento.nome_fantasia ?? '');
      setNomeEmpressarial(response.data.razao_social);
      setCep(response.data.estabelecimento.cep);
      setNumero(response.data.estabelecimento.numero);
      setEstado(response.data.estabelecimento.estado.nome);
      setCidade(response.data.estabelecimento.cidade.nome);
      setEndereco(response.data.estabelecimento.complemento);
      setEmail(response.data.estabelecimento.email);
      getCEP(response.data.estabelecimento.cep);
    } catch (error: any) {
      console.error('ERRO GET CNPJ:', error);
    }
    setLoading(false);
  }

  async function getEstados() {
    try {
      const response = await api_ibge.get(`/localidades/estados`);
      setListaEstados(response.data);
    } catch (error: any) {
      console.error('ERRO GET Estados', error);
    }
  }

  async function getCidades() {
    try {
      const response = await api_ibge.get(
        `/localidades/estados/${uf}/municipios`
      );
      setListaCidades(response.data);
    } catch (error: any) {
      console.error('ERRO Get Cidades:', error);
    }
  }

  function openModalCidades() {
    if (uf) {
      getCidades();
      setModalCidade(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Selecione o seu Estado(UF) !',
      });
      setErrorEstado(true);
    }
  }

  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        // console.log('LOCATION', location);
        setLocalizacao({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
    getLocalizacao();
    if (Platform.OS === 'ios') {
      getPermissionIOS();
    }
    getEstados();
  }, []);

  useEffect(() => {
    if (coordenadasValidas(novaLocalizacao.latitude, novaLocalizacao.longitude)) {
      setRegiao({
        latitude: novaLocalizacao.latitude,
        longitude: novaLocalizacao.longitude,
      });
    }
  }, [novaLocalizacao]);

  useEffect(() => {
    if (checked) {
      setErroChecked(false);
    } else {
      setErroChecked(true);
    }
  }, [checked]);

  function abrirAviso() {
    setModalLocalizacao(false);
    setModalAviso(true);
  }

  const coordenadasPinMapa = coordenadasParaSalvar(
    novaLocalizacao,
    regiao,
    localizacao
  );
  const coordenadasMarcador = coordenadasPinMapa ?? {
    latitude: -1.445839,
    longitude: -48.487557,
  };

  console.log('coordenadasMarcador', coordenadasMarcador);
  console.log('novaLocalizacao', novaLocalizacao);
  console.log('regiao', regiao);
  console.log('localizacao', localizacao);

  return (
    <MainLayoutSecondary loading={loading}>
      <ModalTemplate
        onClose={() => setModalAviso(false)}
        closeSecondary={true}
        visible={modalAviso}
      >
        <View>
          <Text className="text-xl text-red-600 font-bold">
            Atenção
          </Text>
          <Text className="text-lg leading-6">
            Após avançar não será mais permitido a edição da localização.
          </Text>
        </View>
        <View className='mt-3'>
          <FilledButton title="Confirmar" onPress={postPessoaJuridica} />
          <View className='h-2' />
          <FilledButton backgroundColor={'transparent'} border color={colors.secondary20} title="Voltar" onPress={() => setModalAviso(false)} />
        </View>
      </ModalTemplate>
      <ModalTemplate onClose={() => setModalUf(false)} visible={modalUf}>
        <View className="">
          <Text className="text-xl font-bold mt-4">
            Selecione o seu Estado(UF):
          </Text>
          <ScrollView className="w-full h-40">
            {listaEstados &&
              listaEstados
                .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
                .map((item: any, index: any) => (
                  <TouchableOpacity
                    className=" rounded-md my-1 px-2 py-2"
                    style={{
                      backgroundColor: colors.primary90,
                    }}
                    key={index}
                    onPress={() => {
                      setEstado(item.nome);
                      setCidade('');
                      setErrorEstado(false);
                      setUf(item.sigla);
                      setModalUf(false);
                      getCidades();
                    }}
                  >
                    <Text className="text-md font-semibold">
                      {item.nome} - ({item.sigla})
                    </Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>
      </ModalTemplate>
      <ModalTemplate
        onClose={() => setModalCidade(false)}
        visible={modalCidade}
      >
        <View className="">
          <Text className="text-xl font-bold mt-4">
            Selecione o sua cidade:
          </Text>
          <ScrollView className="w-full h-40">
            {listaCidades &&
              listaCidades
                .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
                .map((item: any, index: any) => (
                  <TouchableOpacity
                    className=" rounded-md my-1 px-2 py-2"
                    style={{
                      backgroundColor: colors.primary90,
                    }}
                    key={index}
                    onPress={() => {
                      setCidade(item.nome);
                      setModalCidade(false);
                    }}
                  >
                    <Text className="text-md font-semibold">{item.nome}</Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>
      </ModalTemplate>
      <HeaderPrimary
        voltarScreen={() => {
          navigate('LoginScreen');
        }}
        titulo="Cadastro Anunciante"
        descricao="Alteração de CNPJ, CPF, Endereco, Cidade e Estado deverá ser realizada via suporte, no menu superior esquerdo."
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 320, marginHorizontal: 20 }}>
        <LogoUpload
          imageUri={imagemSelecionada}
          onPress={handlePickImage}
          label="Adicionar logomarca"
          labelWithImage="Toque para alterar"
        />
        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: colors.primary40,
            backgroundColor: colors.primary90,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: colors.primary20,
            }}
          >
            Código de afiliado
          </Text>
          <Caption color={colors.neutralvariant50} margintop={6} fontSize={13}>
            Se você foi indicado por um afiliado, informe o código aqui. Campo opcional.
          </Caption>
          <InputOutlinedCadastro
            mt={10}
            label="Código"
            value={codigoAfiliado}
            maxLength={40}
            placeholder="Ex.: ABC123"
            keyboardType="default"
            uppercase="characters"
            onChange={(text: string) =>
              setCodigoAfiliado(text.replace(/\s/g, '').toUpperCase())
            }
          />
        </View>
        <InputOutlinedCadastro
          mt={8}
          required
          label="CNPJ"
          value={cnpj}
          maxLength={19}
          onBlur={getCNPJ}
          error={errorCnpj}
          keyboardType={'number-pad'}
          onSubmitEditing={() => focusNextInput(input1Ref)}
          onChange={(text: string) => handleCNPJMask(text)}
        />
        <InputOutlinedCadastro
          mt={8}
          required
          label="Nome Fantasia"
          value={nomeFantasia}
          keyboardType={'default'}
          error={errorNomeFantasia}
          onSubmitEditing={() => focusNextInput(input2Ref)}
          onChange={(text: string) => setNomeFantasia(text)}
        />
        <InputOutlinedCadastro
          mt={8}
          required
          refInput={input1Ref}
          value={nomeEmpressarial}
          label="Nome Empresarial"
          keyboardType={'default'}
          error={errorNomeEmpressarial}
          onSubmitEditing={() => focusNextInput(input3Ref)}
          onChange={(text: string) => setNomeEmpressarial(text)}
        />

        <InputOutlinedCadastro
          mt={8}
          required
          label="Email"
          value={email}
          error={errorEmail}
          refInput={input3Ref}
          keyboardType={'email-address'}
          onChange={(text: string) => setEmail(text)}
          onSubmitEditing={() => focusNextInput(input4Ref)}
        />
        <InputOutlinedCadastro
          mt={8}
          required
          maxLength={15}
          value={telefone}
          refInput={input4Ref}
          error={errorTelefone}
          label="Telefone (DDD)"
          keyboardType={'number-pad'}
          onSubmitEditing={() => focusNextInput(input5Ref)}
          onChange={(text: string) => handlePhoneMask(text)}
        />
        <InputOutlinedCadastro
          mt={8}
          label="CEP"
          value={cep}
          maxLength={8}
          error={errorCep}
          onBlur={handleCep}
          refInput={input5Ref}
          keyboardType={'number-pad'}
          onChange={(text: string) => setCep(text.replace(/\D/g, ''))}
          onSubmitEditing={() => focusNextInput(input6Ref)}
        />
        <View className="flex flex-row w-full">
          <TouchableOpacity
            className="flex-1/2"
            onPress={() => setModalUf(true)}
          >
            <View
              style={{ borderColor: errorEstado ? '#f01' : '#49454F' }}
              className="bg-[#FFF] text-base overflow-scroll justify-center border-solid border-[1px] rounded-md h-[52px] w-16 mt-3 pl-2"
            >
              {uf ? (
                <Text className="text-[#000]">{uf}</Text>
              ) : (
                <Text style={{ color: errorEstado ? '#f01' : '#49454F' }}>
                  UF*
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 pl-2 z-10"
            onPress={openModalCidades}
          >
            <View className="bg-[#FFF] text-base overflow-scroll justify-center border-solid border-[1px] border-[#49454F] rounded-md h-[52px] mt-3 pl-2">
              {cidade ? (
                <Text className="text-[#49454F]">{cidade}</Text>
              ) : (
                <Text className="text-[#49454F]">Cidade*</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <InputOutlinedCadastro
          mt={8}
          required
          label="Endereço"
          value={endereco}
          error={errorEndereco}
          refInput={input8Ref}
          keyboardType={'default'}
          onChange={(text: string) => setEndereco(text)}
          onSubmitEditing={() => focusNextInput(input9Ref)}
        />
        <InputOutlinedCadastro
          mt={8}
          required
          refInput={input9Ref}
          value={nomeRepresetante}
          keyboardType={'default'}
          error={errorNomeRepresetante}
          label="Nome representante da empresa"
          onSubmitEditing={() => focusNextInput(input10Ref)}
          onChange={(text: string) => setNomeRepresetante(text)}
        />
        <InputOutlinedCadastro
          mt={8}
          required
          maxLength={14}
          refInput={input10Ref}
          value={cpfRepresetante}
          keyboardType={'number-pad'}
          error={errorCpfRepresetante}
          label="CPF representante da empresa"
          onSubmitEditing={() => focusNextInput(input11Ref)}
          onChange={(text: string) => handleCPFMask(text)}
        />
        <InputOutlined
          mt={8}
          required
          label="Senha (min 8 caracteres)"
          refInput={input11Ref}
          error={errorSenha}
          secureTextEntry={true}
          keyboardType={'default'}
          onChange={(text: string) => setSenha(text)}
          onSubmitEditing={() => focusNextInput(input12Ref)}
        />
        <InputOutlined
          mt={8}
          required
          refInput={input12Ref}
          secureTextEntry={true}
          label="Confirmar Senha"
          keyboardType={'default'}
          error={errorConfirmarSenha}
          onChange={(text: string) => setConfirmarSenha(text)}
        />

        <View className="flex-row items-center gap-2 mt-4">
          <TouchableOpacity onPress={handleCheckboxPress}>
            <View
              className="w-6 h-6 border-2  rounded-lg justify-center items-center"
              style={{
                backgroundColor: checked ? '#6200E8' : 'transparent',
                borderColor: erroChecked ? '#f01' : '#000',
              }}
            >
              {checked && (
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate('TermosCadastrosScreen')}
            className="pr-6"
          >
            <Text
              className="text-center text-xs"
              style={{ color: erroChecked ? '#f01' : '#000' }}
            >
              Se você está criando uma conta, leia e aceite os{' '}
              <Text className="text-[#296FF5]">
                {' '}
                Termos e Condições de uso
              </Text>
              , e a nossa{' '}
              <Text className="text-[#296FF5]">Política de privacidade.</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4">
          <FilledButton
            title="Próximo"
            onPress={validaCampos}
          />
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalLocalizacao} className='z-50'>
        <View className='flex-1 w-full bg-white'>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 flex flex-col gap-3 justify-center p-6 mt-4 bg-white">
              {regiao && Platform.OS === 'android' && (
                <View className="mt-4">
                  <Caption
                    color="#49454F"
                    fontWeight={'bold'}
                    align={'center'}
                    fontSize={16}
                  >
                    Selecione o Endereço do empreendimento:
                  </Caption>
                  <Caption
                    color="#49454F"
                    margintop={6}
                    align={'center'}
                    fontSize={16}
                  >
                    Basta segurar o ícone e arrastar para a melhor posição, você
                    pode dar um zoom também.
                  </Caption>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    onMapReady={() => {
                      Platform.OS === 'android'
                        ? PermissionsAndroid.request(
                          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                        ).then((granted) => {
                          // console.log('Permissão', granted);
                        })
                        : '';
                    }}
                    initialRegion={{
                      latitude: regiao.latitude,
                      longitude: regiao.longitude,
                      latitudeDelta: 0.2,
                      longitudeDelta: 0.2,
                    }}
                    onPress={(e) =>
                      setNovaLocalizacao(e.nativeEvent.coordinate)
                    }
                    style={{
                      height: 400,
                      width: '100%',
                      marginTop: 8,
                    }}
                    loadingEnabled
                    showsBuildings={false}
                    showsTraffic={false}
                  >
                    <Marker
                      coordinate={coordenadasMarcador}
                      onDragEnd={(event) => {
                        setNovaLocalizacao(event.nativeEvent.coordinate);
                      }}
                      draggable
                      pinColor={'#5D35F1'}
                      anchor={{ x: 0.69, y: 1 }}
                      centerOffset={{ x: -18, y: -60 }}
                    />
                  </MapView>
                </View>
              )}

              {regiao && Platform.OS === 'ios' && permissionGrantedIos && (
                <View className="mt-4">
                  <Caption color="#49454F" fontWeight={'bold'} fontSize={16}>
                    Selecione o Endereço do empreendimento:
                  </Caption>
                  <Caption color="#49454F" margintop={6} fontSize={16}>
                    Basta segurar o ícone e arrastar para a melhor posição, você
                    pode dar um zoom também.
                  </Caption>
                  <MapView
                    showsMyLocationButton
                    onMapReady={() => {
                      Platform.OS === 'android'
                        ? PermissionsAndroid.request(
                          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                        ).then((granted) => {
                          // console.log('Permissão', granted);
                        })
                        : '';
                    }}
                    initialRegion={{
                      latitude: regiao.latitude,
                      longitude: regiao.longitude,
                      latitudeDelta: 0.2,
                      longitudeDelta: 0.2,
                    }}
                    onPress={(e) =>
                      setNovaLocalizacao(e.nativeEvent.coordinate)
                    }
                    zoomEnabled
                    style={{
                      height: 400,
                      marginTop: 8,
                      width: '100%',
                      borderRadius: 10,
                    }}
                    zoomTapEnabled={true}
                    loadingEnabled
                    showsBuildings={false}
                    showsTraffic={false}
                  >
                    <Marker
                      coordinate={coordenadasMarcador}
                      onDragEnd={(event) => {
                        setNovaLocalizacao(event.nativeEvent.coordinate);
                      }}
                      draggable
                      pinColor={'#5D35F1'}
                      anchor={{ x: 0.69, y: 1 }}
                      centerOffset={{ x: -18, y: -60 }}
                    />
                  </MapView>
                </View>
              )}

              {Platform.OS === 'ios' && !permissionGrantedIos && (
                <View className="mt-2">
                  <Caption
                    color="#49454F"
                    fontWeight={'bold'}
                    align={'center'}
                    fontSize={16}
                  >
                    Para selecionar a localização do seu empreendimento, é
                    necessário permitir o acesso à sua localização. Após autorização, clique no botão: "Atualizar e Verificar Permissão".
                  </Caption>
                  <View className='mt-4'>
                    <FilledButton
                      title="Abrir Configurações"
                      onPress={() =>
                        Linking.openSettings()
                      }
                    />
                  </View>
                  <View className='mt-4 mb-4'>
                    <FilledButton
                      backgroundColor={'transparent'}
                      color={'#5D35F1'}
                      border
                      title="Atualizar e Verificar Permissão"
                      onPress={() =>
                        getPermissionIOS()
                      }
                    />
                  </View>
                </View>
              )}

              {!regiao && (
                <Caption
                  color="#ef4444"
                  fontWeight={'bold'}
                  align={'center'}
                  margintop={8}
                  fontSize={16}
                >
                  O CEP informado não possui uma localização válida. Por favor, veja o mapa abaixo e confirme o endereço de sua empresa.
                </Caption>
              )}

              {!regiao && localizacao && Platform.OS === 'android' && (
                <View className="mt-4">
                  <Caption
                    color="#49454F"
                    fontWeight={'bold'}
                    align={'center'}
                    fontSize={16}
                  >
                    Selecione o Endereço do empreendimento:
                  </Caption>
                  <Caption
                    color="#49454F"
                    margintop={6}
                    align={'center'}
                    fontSize={16}
                  >
                    Basta segurar o ícone e arrastar para a melhor posição, você
                    pode dar um zoom também.
                  </Caption>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    onMapReady={() => {
                      Platform.OS === 'android'
                        ? PermissionsAndroid.request(
                          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                        ).then((granted) => {
                          // console.log('Permissão', granted);
                        })
                        : '';
                    }}
                    initialRegion={{
                      latitude: localizacao.latitude,
                      longitude: localizacao.longitude,
                      latitudeDelta: 0.2,
                      longitudeDelta: 0.2,
                    }}
                    onPress={(e) =>
                      setNovaLocalizacao(e.nativeEvent.coordinate)
                    }
                    style={{
                      height: 400,
                      width: '100%',
                      marginTop: 8,
                    }}
                    loadingEnabled
                    showsBuildings={false}
                    showsTraffic={false}
                  >
                    <Marker
                      coordinate={coordenadasMarcador}
                      onDragEnd={(event) => {
                        setNovaLocalizacao(event.nativeEvent.coordinate);
                      }}
                      draggable
                      pinColor={'#5D35F1'}
                      anchor={{ x: 0.69, y: 1 }}
                      centerOffset={{ x: -18, y: -60 }}
                    />
                  </MapView>
                </View>
              )}

              {!regiao && localizacao && Platform.OS === 'ios' && permissionGrantedIos && (
                <View className="mt-4">
                  <Caption color="#49454F" fontWeight={'bold'} fontSize={16}>
                    Selecione o Endereço do empreendimento:
                  </Caption>
                  <Caption color="#49454F" margintop={6} fontSize={16}>
                    Basta segurar o ícone e arrastar para a melhor posição, você
                    pode dar um zoom também.
                  </Caption>
                  <MapView
                    showsMyLocationButton
                    onMapReady={() => {
                      Platform.OS === 'android'
                        ? PermissionsAndroid.request(
                          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                        ).then((granted) => {
                          // console.log('Permissão', granted);
                        })
                        : '';
                    }}
                    initialRegion={{
                      latitude: localizacao.latitude,
                      longitude: localizacao.longitude,
                      latitudeDelta: 0.2,
                      longitudeDelta: 0.2,
                    }}
                    onPress={(e) =>
                      setNovaLocalizacao(e.nativeEvent.coordinate)
                    }
                    zoomEnabled
                    style={{
                      height: 400,
                      marginTop: 8,
                      width: '100%',
                      borderRadius: 10,
                    }}
                    zoomTapEnabled={true}
                    loadingEnabled
                    showsBuildings={false}
                    showsTraffic={false}
                  >
                    <Marker
                      coordinate={coordenadasMarcador}
                      onDragEnd={(event) => {
                        setNovaLocalizacao(event.nativeEvent.coordinate);
                      }}
                      draggable
                      pinColor={'#5D35F1'}
                      anchor={{ x: 0.69, y: 1 }}
                      centerOffset={{ x: -18, y: -60 }}
                    />
                  </MapView>
                </View>
              )}

              {errorLocalizacao && (
                <Caption
                  color="#ef4444"
                  fontWeight={'bold'}
                  align={'center'}
                  margintop={8}
                  fontSize={16}
                >
                  {errorLocalizacao}
                </Caption>
              )}

              <View className="mt-6">
                <FilledButton title="Próximo" onPress={() => abrirAviso()} />
                <View className="mt-2" />
                <FilledButton
                  color={'#5D35F1'}
                  border
                  backgroundColor={'white'}
                  title="Voltar"
                  onPress={() => {
                    setRegiao(null);
                    setModalLocalizacao(false)
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </MainLayoutSecondary>
  );
}
