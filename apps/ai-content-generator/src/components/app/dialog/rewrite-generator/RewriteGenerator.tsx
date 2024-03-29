import { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Box, Flex } from '@contentful/f36-components';
import { GeneratorContext } from '@providers/generatorProvider';
import SourceAndFieldSelectors from '@components/app/dialog/common-generator/field-selector/SourceAndFieldSelectors';
import Header from '@components/app/dialog/common-generator/header/Header';
import Output from '@components/app/dialog/common-generator/output/Output';
import { TextFields } from '@hooks/dialog/useSupportedFields';
import generatorReducer, {
  GeneratorParameters,
} from '@components/app/dialog/common-generator/generatorReducer';
import ButtonTextField from './button-text-field/ButtonTextField';
import { GenerateMessage } from '@hooks/dialog/useAI';
import featureConfig from '@configs/features/featureConfig';
import { SegmentEventData } from '@configs/segment/segmentEvent';
import { SegmentAnalyticsContext } from '@providers/segmentAnalyticsProvider';

const initialParameters: GeneratorParameters = {
  isNewText: false,
  sourceField: '',
  output: {
    fieldId: '',
    fieldKey: '',
    locale: '',
    validation: null,
  },
  originalText: { prompt: '', field: '' },
  canGenerateTextFromField: false,
};

const RewriteGenerator = () => {
  const { setProviderData, localeNames, feature, segmentEventData } = useContext(GeneratorContext);
  const { trackEvent } = useContext(SegmentAnalyticsContext);

  const [parameters, dispatch] = useReducer(generatorReducer, initialParameters);
  const [rewritePromptData, setRewritePromptData] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  const newSegmentEventData: SegmentEventData = useMemo(
    () => ({
      feature_id: feature,
      from_prompt: parameters.isNewText,
      source_field: parameters.isNewText ? '' : parameters.sourceField.split(':')[1],
      content_generation_prompt: parameters.originalText.prompt || undefined,
      target_locale: parameters.output.locale,
      rewrite_prompt: rewritePromptData,
    }),
    [
      feature,
      parameters.isNewText,
      parameters.originalText.prompt,
      parameters.output.locale,
      parameters.sourceField,
      rewritePromptData,
    ]
  );

  const updateProviderData = () => {
    if (newSegmentEventData !== segmentEventData) {
      setProviderData({
        dispatch,
        segmentEventData: newSegmentEventData,
      });
    }
  };

  useEffect(updateProviderData, [
    dispatch,
    newSegmentEventData,
    setProviderData,
    trackEvent,
    segmentEventData,
  ]);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, []);

  const inputText = parameters.isNewText
    ? parameters.originalText.prompt
    : parameters.originalText.field;

  const handleGenerate = async (generateMessage: GenerateMessage) => {
    try {
      const localeName = localeNames[parameters.output.locale];
      const userMessage = featureConfig[feature].prompt(inputText, rewritePromptData);
      await generateMessage(userMessage, localeName);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Flex flexDirection="column">
      <Box ref={headerRef}>
        <Header />
        <SourceAndFieldSelectors parameters={parameters} fieldTypes={TextFields} />
        <ButtonTextField inputValue={rewritePromptData} handleInputChange={setRewritePromptData} />
      </Box>
      <Output
        onGenerate={handleGenerate}
        outputFieldId={parameters.output.fieldId}
        outputFieldLocale={parameters.output.locale}
        outputFieldValidation={parameters.output.validation}
        inputText={inputText}
        isNewText={parameters.isNewText}
        headerHeight={headerHeight}
      />
    </Flex>
  );
};

export default RewriteGenerator;
