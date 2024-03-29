import useDialogParameters from '@hooks/dialog/useDialogParameters';
import { AIFeature } from '@configs/features/featureConfig';
import CommonGenerator from '@components/app/dialog/common-generator/CommonGenerator';
import GeneratorProvider from '@providers/generatorProvider';
import { useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import RewriteGenerator from '@components/app/dialog/rewrite-generator/RewriteGenerator';
import { useContext } from 'react';
import { SegmentAnalyticsContext } from '@providers/segmentAnalyticsProvider';
import { SegmentEvents } from '@configs/segment/segmentEvent';

export interface FieldLocales {
  [key: string]: string[];
}

type DialogInvocationParameters = {
  feature: AIFeature;
  entryId: string;
  fieldLocales: FieldLocales;
};

const Dialog = () => {
  const { feature, entryId, isLoading, fieldLocales } = useDialogParameters();
  const { trackEvent } = useContext(SegmentAnalyticsContext);

  const sdk = useSDK<DialogAppSDK>();

  useAutoResizer();

  if (isLoading) {
    return null;
  }

  trackEvent(SegmentEvents.FLOW_START, {
    feature_id: feature,
  });

  const localeNames = sdk.locales.names;
  const defaultLocale = sdk.locales.default;

  const getGenerator = (feature: AIFeature) => {
    switch (feature) {
      case AIFeature.REWRITE:
        return <RewriteGenerator />;

      default:
        return <CommonGenerator />;
    }
  };

  return (
    <GeneratorProvider
      feature={feature}
      entryId={entryId}
      fieldLocales={fieldLocales}
      localeNames={localeNames}
      defaultLocale={defaultLocale}>
      {getGenerator(feature)}
    </GeneratorProvider>
  );
};

export default Dialog;
export type { DialogInvocationParameters };
