import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  TextLink,
  Note,
  Card,
  Stack,
  FormControl,
  Spinner,
  Button,
  Skeleton,
  Text,
  CopyButton,
} from '@contentful/f36-components';
import { CycleIcon, ExternalLinkIcon } from '@contentful/f36-icons';
import { useApi } from 'hooks/useApi';
import { ServiceAccountKeyId } from 'types';
import { ApiErrorType, ERROR_TYPE_MAP, isApiErrorType } from 'apis/apiTypes';
import { KeyValueMap } from 'contentful-management';
import {
  getAdminApiErrorChecklistStatus,
  getDataApiErrorChecklistStatus,
  getGa4PropertyErrorChecklistStatus,
  getServiceKeyChecklistStatus,
} from 'components/config-screen/api-access/display/ChecklistUtils';
import ServiceAccountChecklist from 'components/config-screen/api-access/display/ServiceAccountChecklist';
import { styles } from './DisplayServiceAccountCard.styles';
import HyperLink from 'components/common/HyperLink/HyperLink';

interface Props {
  serviceAccountKeyId: ServiceAccountKeyId;
  onInEditModeChange: Function;
  onAccountSummariesChange: Function;
  isAppInstalled: boolean;
  parameters: KeyValueMap;
  onHasServiceCheckErrorsChange: Function;
  isSavingConfiguration: boolean;
  onIsApiAccessLoading: Function;
}

const DisplayServiceAccountCard = (props: Props) => {
  const {
    serviceAccountKeyId,
    onInEditModeChange,
    onAccountSummariesChange,
    isAppInstalled,
    parameters,
    onHasServiceCheckErrorsChange,
    isSavingConfiguration,
    onIsApiAccessLoading,
  } = props;

  const [isLoadingAdminApi, setIsLoadingAdminApi] = useState(true);
  const [isLoadingDataApi, setIsLoadingDataApi] = useState(true);

  // TODO: refactor this to use a single error state
  const [adminApiError, setAdminApiError] = useState<ApiErrorType>();
  const [dataApiError, setDataApiError] = useState<ApiErrorType>();
  const [invalidServiceAccountError, setInvalidServiceAccountError] = useState<ApiErrorType>();
  const [missingServiceAccountError, setMissingServiceAccountError] = useState<ApiErrorType>();
  const [unknownError, setUnknownError] = useState<ApiErrorType>();
  const [ga4PropertiesError, setGa4PropertiesError] = useState<ApiErrorType>();
  const [showChecks, setShowChecks] = useState<boolean>(false);
  const [accountSummaries, setAccountsSummaries] = useState<any>([]);
  const [isFirstSetup, setIsFirstSetup] = useState<boolean>(false);

  useEffect(() => {
    if (!parameters || !parameters.propertyId) setIsFirstSetup(true);
  }, [parameters]);

  // NOTE: Due to a bug installation parameters are not available at sdk.parameters.installation form the config screen
  // location. Therefore we must pass down the values directly to the useApi hook. If the bug is fixed this won't be
  // necessary
  const api = useApi(serviceAccountKeyId);

  const handleApiError = (error: ApiErrorType) => {
    switch (error.errorType) {
      case ERROR_TYPE_MAP.invalidServiceAccount:
      case ERROR_TYPE_MAP.invalidServiceAccountKey:
        setInvalidServiceAccountError(error);
        break;
      case ERROR_TYPE_MAP.missingServiceAccountKeyFile:
        setMissingServiceAccountError(error);
        break;
      case ERROR_TYPE_MAP.disabledAdminApi:
        setAdminApiError(error);
        break;
      case ERROR_TYPE_MAP.disabledDataApi:
        setDataApiError(error);
        break;
      case ERROR_TYPE_MAP.invalidProperty:
        setAdminApiError(undefined);
        setDataApiError(undefined);
        break;
      default:
        setUnknownError(error);
        throw error;
    }
  };

  const verifyAdminApi = useCallback(async () => {
    try {
      onIsApiAccessLoading(true);
      setIsLoadingAdminApi(true);
      const fetchedAccountSummaries = await api.listAccountSummaries();
      setAccountsSummaries(fetchedAccountSummaries);
      onAccountSummariesChange(fetchedAccountSummaries);
      fetchedAccountSummaries.length
        ? setGa4PropertiesError(undefined)
        : setGa4PropertiesError({
            errorType: ERROR_TYPE_MAP.noAccountsOrPropertiesFound,
            message: 'No accounts or properties could be found',
            status: 500,
          });
      setAdminApiError(undefined);
    } catch (e: any) {
      if (isApiErrorType(e)) handleApiError(e);
      else {
        setUnknownError(e);
        throw e;
      }
    } finally {
      onIsApiAccessLoading(false);
      setIsLoadingAdminApi(false);
    }

    return () => {
      setAdminApiError(undefined);
      setIsLoadingAdminApi(false);
    };

    // It wants to add onAccountSummariesChange as a dependency but this will cause an infinite re-render
    // isAppInstalled is needed as a dependency to trigger this called once the app is installed succesffully
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, isAppInstalled]);

  const verifyDataApi = useCallback(async () => {
    try {
      setIsLoadingDataApi(true);
      await api.runReports();
      setDataApiError(undefined);
    } catch (e: any) {
      if (isApiErrorType(e)) handleApiError(e);
      else {
        setUnknownError(e);
        throw e;
      }
    } finally {
      setIsLoadingDataApi(false);
    }

    return () => {
      setDataApiError(undefined);
      setIsLoadingDataApi(false);
    };

    // isAppInstalled is needed as a dependency to trigger this called once the app is installed succesffully
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, isAppInstalled]);

  useEffect(() => {
    onHasServiceCheckErrorsChange(
      adminApiError ||
        dataApiError ||
        ga4PropertiesError ||
        invalidServiceAccountError ||
        unknownError ||
        !accountSummaries.length
    );
  }, [
    adminApiError,
    dataApiError,
    ga4PropertiesError,
    onHasServiceCheckErrorsChange,
    invalidServiceAccountError,
    unknownError,
    accountSummaries.length,
  ]);

  const handleErrorChanges = useCallback(() => {
    adminApiError || dataApiError || invalidServiceAccountError || ga4PropertiesError
      ? setShowChecks(true)
      : setShowChecks(false);
  }, [adminApiError, dataApiError, ga4PropertiesError, invalidServiceAccountError]);

  useEffect(() => {
    if (isSavingConfiguration) return;

    verifyAdminApi();
    verifyDataApi();
  }, [isSavingConfiguration, verifyAdminApi, verifyDataApi]);

  const handleApiTestClick = () => {
    verifyAdminApi();
    verifyDataApi();
    setUnknownError(undefined);
    handleErrorChanges();
  };

  useEffect(() => {
    handleErrorChanges();
  }, [handleErrorChanges]);

  interface BadgeNoteType {
    badgeLabel: string;
    noteMessage?: string | JSX.Element;
  }

  // TODO: Update these Render functions (RenderSimpleBadgeNote, RenderStatusInfo) to have more robust error messages for the user to act upon
  // Also needs a UI refresh to look prettier
  const RenderSimpleBadgeNote = ({ badgeLabel, noteMessage }: BadgeNoteType) => {
    return (
      <Stack spacing="spacingL" marginBottom="none" alignItems="flex-start" flexDirection="column">
        <Badge variant="negative">{badgeLabel}</Badge>
        {noteMessage && <Note variant="negative">{noteMessage}</Note>}
      </Stack>
    );
  };

  const configError =
    invalidServiceAccountError ||
    missingServiceAccountError ||
    adminApiError ||
    dataApiError ||
    ga4PropertiesError;

  useEffect(() => {
    if (configError) setShowChecks(true);
  }, [configError]);

  const RenderStatusInfo = () => {
    if (configError) {
      return isFirstSetup ? (
        <Badge variant="primary">Finish configuration steps below</Badge>
      ) : (
        <Badge variant="negative">Problems with configuration</Badge>
      );
    } else if (unknownError) {
      const noteMessage = (
        <HyperLink
          body="An unknown error occurred. You can try the action again in a few minutes, or contact support if the error persists."
          substring="contact support"
          hyperLinkHref="https://www.contentful.com/support/?utm_source=webapp&utm_medium=help-menu&utm_campaign=in-app-help"
          icon={<ExternalLinkIcon />}
          alignIcon="end"
        />
      );
      return <RenderSimpleBadgeNote badgeLabel="Unknown Error" noteMessage={noteMessage} />;
    }

    return <Badge variant="positive">Successfully configured</Badge>;
  };

  const isLoading = isSavingConfiguration || isLoadingAdminApi || isLoadingDataApi;

  const loadingSkeleton = (width = '100%') => {
    return (
      <Skeleton.Container svgHeight={21}>
        <Skeleton.BodyText numberOfLines={1} lineHeight={20} width={width} />
      </Skeleton.Container>
    );
  };

  return (
    <Card>
      <Flex justifyContent="space-between" marginBottom="spacingS">
        <Box marginBottom="none">
          <b>Google Service Account Details</b>
        </Box>
        <Button
          testId="editServiceAccountButton"
          onClick={() => onInEditModeChange(true)}
          variant="secondary"
          size="small">
          Replace key
        </Button>
      </Flex>
      <FormControl>
        <FormControl.Label marginBottom="none">Service Account</FormControl.Label>
        <Box>
          {isLoading ? (
            loadingSkeleton('65%')
          ) : (
            <Flex alignItems="center" gap="spacingXs">
              <Box>{serviceAccountKeyId.clientEmail}</Box>
              <CopyButton
                value={serviceAccountKeyId.clientEmail}
                size="small"
                style={{
                  display: 'block',
                  border: 'none',
                  padding: 0,
                  lineHeight: '1rem',
                  height: '1rem',
                  width: 'auto',
                }}
              />
            </Flex>
          )}
        </Box>
      </FormControl>
      <FormControl>
        <FormControl.Label marginBottom="none">Key ID</FormControl.Label>
        {isLoading ? loadingSkeleton('50%') : <Box>{serviceAccountKeyId.id}</Box>}
      </FormControl>
      <FormControl marginBottom="none">
        <FormControl.Label marginBottom="spacing2Xs">
          <Flex alignItems="center">
            <Text fontWeight="fontWeightDemiBold" marginRight="spacing2Xs">
              Status
            </Text>
            {isLoading ? (
              <Spinner size="small" />
            ) : (
              <CycleIcon size="small" style={{ cursor: 'pointer' }} onClick={handleApiTestClick} />
            )}
          </Flex>
        </FormControl.Label>
        <Box>
          {isLoading ? (
            loadingSkeleton('45%')
          ) : (
            <Flex className={styles.statusWrapper}>
              <Box paddingRight="spacingS">
                <RenderStatusInfo />
              </Box>
              {!unknownError && (
                <Box>
                  {showChecks ? (
                    <TextLink as="button" variant="primary" onClick={() => setShowChecks(false)}>
                      Hide status checks
                    </TextLink>
                  ) : (
                    <TextLink as="button" variant="primary" onClick={() => setShowChecks(true)}>
                      Show status checks
                    </TextLink>
                  )}
                </Box>
              )}
            </Flex>
          )}
        </Box>
      </FormControl>
      {!unknownError && showChecks && !isLoading && (
        <ServiceAccountChecklist
          serviceAccountCheck={{
            ...getServiceKeyChecklistStatus(
              parameters,
              invalidServiceAccountError,
              missingServiceAccountError
            ),
          }}
          adminApiCheck={{
            ...getAdminApiErrorChecklistStatus(
              isFirstSetup,
              parameters,
              invalidServiceAccountError || missingServiceAccountError,
              adminApiError
            ),
          }}
          dataApiCheck={{
            ...getDataApiErrorChecklistStatus(
              isFirstSetup,
              parameters,
              invalidServiceAccountError || missingServiceAccountError,
              dataApiError
            ),
          }}
          ga4PropertiesCheck={{
            ...getGa4PropertyErrorChecklistStatus(
              isFirstSetup,
              invalidServiceAccountError || missingServiceAccountError,
              adminApiError,
              ga4PropertiesError
            ),
          }}
        />
      )}
    </Card>
  );
};

export default DisplayServiceAccountCard;
