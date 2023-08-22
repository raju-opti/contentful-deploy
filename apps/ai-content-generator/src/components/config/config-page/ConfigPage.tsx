import { useReducer } from 'react';
import { Box, Heading } from '@contentful/f36-components';
import ConfigSection from '@components/config/config-section/ConfigSection';
import BrandSection from '@components/config/brand-section/BrandSection';
import { styles } from './ConfigPage.styles';
import { Sections } from '@components/config/configText';
import { defaultModelId } from '@configs/ai/gptModels';
import useInitializeParameters from '@hooks/config/useInitializeParameters';
import useSaveConfigHandler from '@hooks/config/useSaveConfigHandler';
import parameterReducer from '@components/config/parameterReducer';
import { AppInstallationParameters } from '@locations/ConfigScreen';
import { ConfigErrors } from '@components/config/configText';

const initialParameters: AppInstallationParameters = {
  model: defaultModelId,
  apiKey: '',
  profile: {},
};

const ConfigPage = () => {
  const [parameters, dispatchParameters] = useReducer(parameterReducer, initialParameters);

  const validateParams = (params: AppInstallationParameters): string[] => {
    const notifierErrors = [];

    if (!params.apiKey) {
      notifierErrors.push(ConfigErrors.missingApiKey);
    }

    if (!params.model) {
      notifierErrors.push(ConfigErrors.missingModel);
    }

    if (!params.profile.profile) {
      notifierErrors.push(ConfigErrors.missingProfile);
    }

    return notifierErrors;
  };

  useSaveConfigHandler(parameters, validateParams);
  useInitializeParameters(dispatchParameters);

  return (
    <Box css={styles.body}>
      <Heading>{Sections.pageHeading}</Heading>
      <hr css={styles.splitter} />
      <ConfigSection
        apiKey={parameters.apiKey}
        model={parameters.model}
        dispatch={dispatchParameters}
      />
      <hr css={styles.splitter} />
      <BrandSection profile={parameters.profile} dispatch={dispatchParameters} />
    </Box>
  );
};

export default ConfigPage;