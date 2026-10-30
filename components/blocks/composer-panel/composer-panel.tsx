'use client';

import { useState } from 'react';
import { Composer, type ComposerProps } from '@/components/blocks/composer/composer';
import { PermissionMenu, type ComposerPermission } from './permission-menu';
import { ComposerStatusTab } from './composer-status-tab';
import { ModelPicker, MODEL_PROVIDERS, type ComposerModelProvider } from './model-picker';
import { cx } from '@/utils/cx';

export { PermissionMenu, COMPOSER_PERMISSIONS, type ComposerPermission } from './permission-menu';
export { ComposerStatusTab } from './composer-status-tab';
export { ModelPicker, MODEL_PROVIDERS, EFFORT_LEVELS, type ComposerModelProvider } from './model-picker';

export type ComposerPanelProps = ComposerProps & {
  showStatus?: boolean;
  permission?: ComposerPermission;
  defaultPermission?: ComposerPermission;
  onPermissionChange?: (permission: ComposerPermission) => void;
  learnMoreHref?: string;
  onLearnMore?: () => void;
  providers?: ComposerModelProvider[];
  defaultModel?: string;
};

export function ComposerPanel({ showStatus = true, permission, defaultPermission = 'auto', onPermissionChange, learnMoreHref, onLearnMore, providers, defaultModel, models, selectedModel, onModelChange, effort, defaultEffort = 1, onEffortChange, status, className, ...props }: ComposerPanelProps) {
  const catalogue = providers ?? (models ? [{ id: 'custom', name: 'Models', models }] : MODEL_PROVIDERS);
  const [internalModel, setInternalModel] = useState(defaultModel);
  const [internalEffort, setInternalEffort] = useState(defaultEffort);
  const model = selectedModel ?? internalModel ?? catalogue[0]?.models[0]?.id;
  const busy = props.disabled || props.isWorking;
  return <div className={cx('ui-composer-panel', className)}><Composer {...props}
    placeholder={props.placeholder ?? 'Hi, what do you need today?'} maxInputHeight={200} statusPlacement="tab"
    status={status !== undefined ? status : showStatus ? <ComposerStatusTab branch={props.branch} project={props.project} context={props.contextPercent} /> : null}
    footerStart={<PermissionMenu value={permission} defaultValue={defaultPermission} onChange={onPermissionChange} learnMoreHref={learnMoreHref} onLearnMore={onLearnMore} disabled={busy} />}
    modelPicker={<ModelPicker providers={catalogue} value={model} onChange={next => { if (selectedModel === undefined) setInternalModel(next); onModelChange?.(next); }} effort={effort ?? internalEffort} onEffortChange={next => { if (effort === undefined) setInternalEffort(next); onEffortChange?.(next); }} disabled={busy} />}
    className="ui-composer-panel__composer" /></div>;
}
