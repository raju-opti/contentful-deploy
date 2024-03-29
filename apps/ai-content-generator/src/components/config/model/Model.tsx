import { ChangeEvent, Dispatch } from 'react';
import { FormControl, Select } from '@contentful/f36-components';
import { gptModels, defaultModelId } from '@configs/ai/gptModels';
import { ModelText } from '../configText';
import { ParameterAction, ParameterReducer } from '../parameterReducer';
import { ConfigErrors } from '../configText';

interface Props {
  model: string;
  dispatch: Dispatch<ParameterReducer>;
}

const Model = (props: Props) => {
  const { model, dispatch } = props;

  const modelList = gptModels.map((model) => (
    <Select.Option key={model.id} value={model.id}>
      {model.name}
    </Select.Option>
  ));

  const isInvalid = !model;
  const isSelectionInModelList = gptModels.some((modelOption) => modelOption.id === model);
  const value = isSelectionInModelList ? model : defaultModelId;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: ParameterAction.UPDATE_MODEL, value: e.target.value });
  };

  return (
    <FormControl isRequired marginBottom="none" isInvalid={isInvalid}>
      <FormControl.Label>{ModelText.title}</FormControl.Label>
      <Select value={value} onChange={handleChange}>
        {modelList}
      </Select>

      <FormControl.HelpText>{ModelText.helpText}</FormControl.HelpText>
      {isInvalid && (
        <FormControl.ValidationMessage>{ConfigErrors.missingModel}</FormControl.ValidationMessage>
      )}
    </FormControl>
  );
};

export default Model;
