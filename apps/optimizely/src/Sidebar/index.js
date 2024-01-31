import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import { isFxProject } from '../util';

const styles = {
  button: css({
    marginBottom: tokens.spacingS,
  }),
};

const getFlagUrl = (projectId, flagKey) => {
  return `https://app.optimizely.com/v2/projects/${projectId}/flags/manage/${flagKey}/rules/production`;
};

const getRuleEditUrl = (projectId, flagKey, ruleKey, environment) => {
  return `https://app.optimizely.com/v2/projects/${projectId}/flags/manage/${flagKey}/rules/${environment}/edit/${ruleKey}`;
};

const getAllFlagsUrl = (projectId, environment) => {
  return `https://app.optimizely.com/v2/projects/${projectId}/flags/list?environment=${environment}`;
};

const getExperimentUrl = (projectId, experimentId) => {
  return `https://app.optimizely.com/v2/projects/${projectId}/experiments/${experimentId}/variations`;
};

const getAllExperimentsUrl = (projectId) => {
  return `https://app.optimizely.com/v2/projects/${projectId}/experiments`;
};

const fetchProjectData = async (client, projectId) => {
  
}

export default function Sidebar(props) {
  const [experimentId, setExperimentId] = useState(props.sdk.entry.fields.experimentId.getValue());

  console.log('sidebar fields ...', props.sdk.entry.fields.experimentId.getValue(), props.sdk.entry.fields.flagKey.getValue())
  const flagKey = props.sdk.entry.fields.flagKey.getValue();
  // only used for FX project, the experimentKey field will have the key of the rule and the envrionment field will have the environment key
  const ruleKey = props.sdk.entry.fields.experimentKey.getValue();
  const environment = props.sdk.entry.fields.environment.getValue();

  const { parameters } = props.sdk;

  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return () => {
      props.sdk.window.stopAutoResizer();
    };
  }, [props.sdk.window]);

  useEffect(() => {
    const unsubscribe = props.sdk.entry.fields.experimentId.onValueChanged((value) => {
      setExperimentId(value);
    });
    return () => {
      return unsubscribe();
    };
  }, [props.sdk.entry.fields.experimentId]);

  const projectId = parameters.installation.optimizelyProjectId;

  return (
    <div data-test-id="sidebar">
      <Button
        buttonType="primary"
        isFullWidth
        className={styles.button}
        disabled={!experimentId}
        href={isFxProject(props.sdk) ? getRuleEditUrl(projectId, flagKey, ruleKey, environment) : getExperimentUrl(projectId, experimentId)}
        target="_blank"
        data-test-id="view-experiment">
        View in Optimizely
      </Button>
      <Button
        buttonType="muted"
        isFullWidth
        className={styles.button}
        disabled={isFxProject(props.sdk) && !experimentId}
        target="_blank"
        href={isFxProject(props.sdk) ? getAllFlagsUrl(projectId, environment) : getAllExperimentsUrl(projectId)}
        data-test-id="view-all">
        <>{`View all ${isFxProject(props.sdk) ? 'flags' : 'experiments'}`}</>
      </Button>
    </div>
  );
}

Sidebar.propTypes = {
  sdk: PropTypes.shape({
    entry: PropTypes.shape({
      fields: PropTypes.shape({
        experimentId: PropTypes.object.isRequired,
      }).isRequired,
    }),
    window: PropTypes.object.isRequired,
    parameters: PropTypes.shape({
      installation: PropTypes.shape({
        optimizelyProjectId: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  client: PropTypes.any.isRequired,
};
