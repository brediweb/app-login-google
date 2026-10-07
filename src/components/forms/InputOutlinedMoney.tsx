import React from 'react';
import { TextInput } from 'react-native-paper';
import { TouchableOpacity, View } from 'react-native';
import Caption from '@components/typography/Caption';
import { colors } from 'src/styles/colors';

interface PropsInputOutlinedMoney {
  label?: string;
  value?: string;
  onChange?: (unmasked: string) => void;
  mt?: number;
  placeholder?: string;
  error?: boolean;
  clearInput?: () => void;
  required?: boolean;
  height?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  editable?: boolean;
}

/** Formata valor (dígitos = centavos) para exibição pt-BR: "123,45" */
function formatToReal(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  const num = parseInt(digits, 10) / 100;
  const [inteiro, decimal = '00'] = num.toFixed(2).split('.');
  const inteiroComMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${inteiroComMilhar},${decimal}`;
}

/** Extrai apenas dígitos do texto (valor em centavos para compatibilidade com validações existentes) */
function parseFromReal(text: string): string {
  return text.replace(/\D/g, '');
}

const InputOutlinedMoney: React.FC<PropsInputOutlinedMoney> = ({
  label = '',
  value = '',
  onChange,
  mt,
  placeholder,
  error,
  clearInput,
  required,
  height,
  onBlur,
  onFocus,
  editable = true,
}) => {
  const displayValue = value ? `R$ ${formatToReal(value)}` : '';

  const handleChangeText = (text: string) => {
    const unmasked = parseFromReal(text);
    onChange?.(unmasked);
  };

  return (
    <View style={{ marginTop: mt ?? 0 }}>
      {clearInput && (
        <View className="w-full h-4 relative z-50">
          <TouchableOpacity
            className="absolute h-12 flex top-10 right-2"
            onPress={clearInput}
          >
            <Caption
              fontSize={14}
              align={'center'}
              fontWeight={'500'}
              color={colors.primary20}
            >
              Limpar
            </Caption>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        label={label ? `${label}${required ? '*' : ''}` : undefined}
        error={error}
        mode="outlined"
        value={displayValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        onBlur={onBlur}
        onFocus={onFocus}
        editable={editable}
        style={{ color: '#49454F', ...(height != null && { minHeight: height }) }}
      />
    </View>
  );
};

export default InputOutlinedMoney;
