import React, { useState } from 'react';
import { View, Text, ScrollView, Button, Input, Modal, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useFinanceStore } from '@/store/useFinanceStore';
import { MemberRole } from '@/types';
import styles from './index.module.scss';

const avatarOptions = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👱', '👲', '🧔'];
const colorOptions = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const roleLabels: Record<MemberRole, string> = {
  owner: '所有者',
  editor: '编辑者',
  viewer: '查看者',
};

const roleDescriptions: Record<MemberRole, string> = {
  owner: '可管理账本和成员',
  editor: '可添加和编辑账单',
  viewer: '仅可查看账单',
};

const ShareLedgerPage: React.FC = () => {
  const getSharedLedgers = useFinanceStore((state) => state.getSharedLedgers);
  const createSharedLedger = useFinanceStore((state) => state.createSharedLedger);
  const addMember = useFinanceStore((state) => state.addMember);
  const updateMemberRole = useFinanceStore((state) => state.updateMemberRole);
  const removeMember = useFinanceStore((state) => state.removeMember);

  const ledgers = getSharedLedgers();
  const [selectedLedgerId, setSelectedLedgerId] = useState(ledgers[0]?.id || '');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingMember, setEditingMember] = useState<{ ledgerId: string; memberId: string } | null>(null);

  const [ledgerName, setLedgerName] = useState('');
  const [ledgerDesc, setLedgerDesc] = useState('');
  const [ledgerColor, setLedgerColor] = useState('#10B981');

  const [memberNickname, setMemberNickname] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('👨');
  const [memberRole, setMemberRole] = useState<MemberRole>('viewer');
  const [newRole, setNewRole] = useState<MemberRole>('viewer');

  const selectedLedger = ledgers.find(l => l.id === selectedLedgerId);

  const handleCreateLedger = () => {
    if (!ledgerName.trim()) {
      Taro.showToast({ title: '请输入账本名称', icon: 'none' });
      return;
    }
    createSharedLedger(ledgerName.trim(), ledgerDesc.trim(), ledgerColor);
    setShowCreateModal(false);
    setLedgerName('');
    setLedgerDesc('');
    setLedgerColor('#10B981');
    Taro.showToast({ title: '创建成功', icon: 'success' });
    setTimeout(() => {
      const updated = getSharedLedgers();
      if (updated.length > 0) {
        setSelectedLedgerId(updated[updated.length - 1].id);
      }
    }, 100);
  };

  const handleAddMember = () => {
    if (!memberNickname.trim()) {
      Taro.showToast({ title: '请输入成员昵称', icon: 'none' });
      return;
    }
    if (!selectedLedgerId) {
      Taro.showToast({ title: '请先选择账本', icon: 'none' });
      return;
    }
    addMember(selectedLedgerId, memberNickname.trim(), memberAvatar, memberRole);
    setShowAddMemberModal(false);
    setMemberNickname('');
    setMemberAvatar('👨');
    setMemberRole('viewer');
    Taro.showToast({ title: '添加成功', icon: 'success' });
  };

  const handleEditRole = (ledgerId: string, memberId: string, currentRole: MemberRole) => {
    setEditingMember({ ledgerId, memberId });
    setNewRole(currentRole);
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!editingMember) return;
    updateMemberRole(editingMember.ledgerId, editingMember.memberId, newRole);
    setShowRoleModal(false);
    setEditingMember(null);
    Taro.showToast({ title: '权限已更新', icon: 'success' });
  };

  const handleRemoveMember = (ledgerId: string, memberId: string) => {
    Taro.showModal({
      title: '移除成员',
      content: '确定要移除该成员吗？',
      success: (res) => {
        if (res.confirm) {
          removeMember(ledgerId, memberId);
          Taro.showToast({ title: '已移除', icon: 'success' });
        }
      },
    });
  };

  const handleSelectLedger = (id: string) => {
    setSelectedLedgerId(id);
  };

  const handleOpenAddMember = () => {
    if (!selectedLedgerId) {
      Taro.showToast({ title: '请先选择账本', icon: 'none' });
      return;
    }
    setShowAddMemberModal(true);
  };

  const roleOptions = ['所有者', '编辑者', '查看者'];
  const roleValues: MemberRole[] = ['owner', 'editor', 'viewer'];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.header}>
          <Text className={styles.headerTitle}>共享账本</Text>
          <Button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
            + 新建
          </Button>
        </View>

        <View className={styles.ledgerList}>
          {ledgers.map((ledger) => (
            <View
              key={ledger.id}
              className={classnames(styles.ledgerCard, selectedLedgerId === ledger.id && styles.active)}
              onClick={() => handleSelectLedger(ledger.id)}
            >
              <View className={styles.ledgerHeader} style={{ backgroundColor: `${ledger.color}15` }}>
                <View className={styles.ledgerColorDot} style={{ backgroundColor: ledger.color }} />
                <Text className={styles.ledgerName}>{ledger.name}</Text>
                <View className={styles.memberCount}>
                  <Text className={styles.memberIcon}>👥</Text>
                  <Text className={styles.memberCountText}>{ledger.members.length}</Text>
                </View>
              </View>
              {ledger.description && (
                <Text className={styles.ledgerDesc}>{ledger.description}</Text>
              )}
            </View>
          ))}
        </View>

        {selectedLedger && (
          <View className={styles.memberSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>成员列表</Text>
              <Button className={styles.addMemberBtn} onClick={handleOpenAddMember}>
                + 添加
              </Button>
            </View>

            <View className={styles.memberList}>
              {selectedLedger.members.map((member) => (
                <View key={member.id} className={styles.memberItem}>
                  <View className={styles.memberAvatar}>{member.avatar}</View>
                  <View className={styles.memberInfo}>
                    <View className={styles.memberNameRow}>
                      <Text className={styles.memberName}>{member.nickname}</Text>
                      {member.role === 'owner' && (
                        <Text className={styles.ownerBadge}>👑 所有者</Text>
                      )}
                    </View>
                    <Text className={styles.memberRole}>
                      {roleLabels[member.role]} · {roleDescriptions[member.role]}
                    </Text>
                    <Text className={styles.memberJoined}>加入于 {member.joinedAt}</Text>
                  </View>
                  {member.role !== 'owner' && (
                    <View className={styles.memberActions}>
                      <Button
                        className={styles.roleBtn}
                        onClick={() => handleEditRole(selectedLedger.id, member.id, member.role)}
                      >
                        权限
                      </Button>
                      <Button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveMember(selectedLedger.id, member.id)}
                      >
                        移除
                      </Button>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Modal
        title='创建共享账本'
        onCancel={() => setShowCreateModal(false)}
        onConfirm={handleCreateLedger}
        show={showCreateModal}
        cancelText='取消'
        confirmText='创建'
      >
        <View className={styles.modalContent}>
          <Text className={styles.modalLabel}>账本名称</Text>
          <Input
            className={styles.modalInput}
            value={ledgerName}
            onInput={(e) => setLedgerName(e.detail.value)}
            placeholder='请输入账本名称'
            maxlength={20}
            focus
          />

          <Text className={styles.modalLabel}>账本描述 (可选)</Text>
          <Input
            className={styles.modalInput}
            value={ledgerDesc}
            onInput={(e) => setLedgerDesc(e.detail.value)}
            placeholder='简单描述一下这个账本'
            maxlength={50}
          />

          <Text className={styles.modalLabel}>选择颜色</Text>
          <View className={styles.colorPicker}>
            {colorOptions.map((color) => (
              <View
                key={color}
                className={classnames(styles.colorOption, ledgerColor === color && styles.selected)}
                style={{ backgroundColor: color }}
                onClick={() => setLedgerColor(color)}
              />
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        title='添加成员'
        onCancel={() => setShowAddMemberModal(false)}
        onConfirm={handleAddMember}
        show={showAddMemberModal}
        cancelText='取消'
        confirmText='添加'
      >
        <View className={styles.modalContent}>
          <Text className={styles.modalLabel}>成员昵称</Text>
          <Input
            className={styles.modalInput}
            value={memberNickname}
            onInput={(e) => setMemberNickname(e.detail.value)}
            placeholder='请输入成员昵称'
            maxlength={10}
            focus
          />

          <Text className={styles.modalLabel}>选择头像</Text>
          <View className={styles.avatarPicker}>
            {avatarOptions.map((avatar) => (
              <View
                key={avatar}
                className={classnames(styles.avatarOption, memberAvatar === avatar && styles.selected)}
                onClick={() => setMemberAvatar(avatar)}
              >
                <Text className={styles.avatarEmoji}>{avatar}</Text>
              </View>
            ))}
          </View>

          <Text className={styles.modalLabel}>设置权限</Text>
          <Picker
            mode='selector'
            range={roleOptions}
            value={roleValues.indexOf(memberRole)}
            onChange={(e) => setMemberRole(roleValues[parseInt(e.detail.value)])}
          >
            <View className={styles.pickerValue}>
              <Text>{roleLabels[memberRole]} - {roleDescriptions[memberRole]}</Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </Picker>
        </View>
      </Modal>

      <Modal
        title='修改成员权限'
        onCancel={() => setShowRoleModal(false)}
        onConfirm={handleSaveRole}
        show={showRoleModal}
        cancelText='取消'
        confirmText='保存'
      >
        <View className={styles.modalContent}>
          <Text className={styles.modalLabel}>选择新权限</Text>
          <View className={styles.roleList}>
            {roleValues.map((role, index) => (
              <View
                key={role}
                className={classnames(styles.roleOption, newRole === role && styles.selected)}
                onClick={() => setNewRole(role)}
              >
                <Text className={styles.roleName}>{roleOptions[index]}</Text>
                <Text className={styles.roleDesc}>{roleDescriptions[role]}</Text>
                {newRole === role && <Text className={styles.checkIcon}>✓</Text>}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ShareLedgerPage;
