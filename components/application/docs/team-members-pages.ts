export const teamMembersPages={
 'team-members':{title:'Team Members',group:'Blocks',description:'Controlled member lists and searchable tables built from shared rows, avatars, role/status selectors and confirmation dialogs. The application owns saved members and invite/remove operations.',sections:['Preview','Density','Surfaces','Searchable table','Embedded management','Read only','Empty team','Async changes'],snippet:`<TeamMembers\n  members={savedMembers}\n  currentUserId={currentUser.id}\n  onRoleChange={saveMemberRole}\n  onInvite={addMember}\n  onRemove={removeMember}\n/>`},
} as const;
