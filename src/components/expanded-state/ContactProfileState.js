import lang from 'i18n-js';
import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation } from '../../navigation/Navigation';
import { useTheme } from '../../theme/ThemeContext';
import { magicMemo } from '../../utils';
import ProfileModal from './profile/ProfileModal';
import useExperimentalFlag, { PROFILES } from '@/config/experimentalHooks';
import { maybeSignUri } from '@/handlers/imgix';
import {
  removeFirstEmojiFromString,
  returnStringFirstEmoji,
} from '@/helpers/emojiHandler';
import {
  useAccountSettings,
  useContacts,
  useENSAvatar,
  usePersistentDominantColorFromImage,
} from '@/hooks';
import {
  addressHashedColorIndex,
  addressHashedEmoji,
} from '@/utils/profileUtils';

const ContactProfileState = ({ address, color, contact, ens, nickname }) => {
  const profilesEnabled = useExperimentalFlag(PROFILES);
  const contactNickname = contact?.nickname || nickname;
  const { goBack } = useNavigation();
  const { onAddOrUpdateContacts } = useContacts();
  const { colors } = useTheme();

  const [value, setValue] = useState(
    profilesEnabled
      ? contactNickname
      : removeFirstEmojiFromString(contactNickname)
  );

  const emoji = useMemo(
    () =>
      profilesEnabled
        ? addressHashedEmoji(address)
        : returnStringFirstEmoji(contactNickname),
    [address, contactNickname, profilesEnabled]
  );

  const colorIndex = useMemo(
    () => (profilesEnabled ? addressHashedColorIndex(address) : color || 0),
    [address, color, profilesEnabled]
  );

  const { network } = useAccountSettings();

  const handleAddContact = useCallback(() => {
    const nickname = profilesEnabled
      ? value
      : (emoji ? `${emoji} ${value}` : value).trim();
    if (value?.length > 0) {
      onAddOrUpdateContacts(address, nickname, color, network, ens);
      goBack();
    }
    android && Keyboard.dismiss();
  }, [
    address,
    color,
    emoji,
    ens,
    goBack,
    network,
    onAddOrUpdateContacts,
    profilesEnabled,
    value,
  ]);

  const handleCancel = useCallback(() => {
    goBack();
    android && Keyboard.dismiss();
  }, [goBack]);

  const { data: avatar } = useENSAvatar(ens, { enabled: Boolean(ens) });
  const avatarUrl = profilesEnabled ? avatar?.imageUrl : undefined;

  const { result: dominantColor } = usePersistentDominantColorFromImage(
    maybeSignUri(avatarUrl || '') || ''
  );

  const accentColor =
    dominantColor || colors.avatarBackgrounds[colorIndex || 0];

  return (
    <ProfileModal
      accentColor={accentColor}
      address={address}
      emojiAvatar={emoji}
      handleCancel={handleCancel}
      handleSubmit={handleAddContact}
      imageAvatar={avatarUrl}
      inputValue={value}
      onChange={setValue}
      placeholder={lang.t('contacts.input_placeholder')}
      profileName={ens}
      submitButtonText={lang.t('contacts.options.add')}
      toggleAvatar
      toggleSubmitButtonIcon={false}
    />
  );
};

export default magicMemo(ContactProfileState, ['address', 'color', 'contact']);
