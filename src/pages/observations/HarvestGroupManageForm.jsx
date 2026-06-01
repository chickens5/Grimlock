export default function HarvestGroupManageForm({
  isManagingExistingGroup,
  selectedHarvestGroup,
  selectedHarvestGroupId,
  harvestGroups,
  groupFormState,
  groupFormSubmitting,
  groupImageFile,
  groupImagePreviewUrl,
  resolveImageUrl,
  onStartNewHarvestGroup,
  onCancelNewHarvestGroup,
  onGroupFormChange,
  onGroupFormSubmit,
  onDeleteHarvestGroup,
  onGroupImageFileChange,
  setGroupFormState
}) {
  return (
    <section className="editor-card manage-card">
      <div className="sidebar-section-header">
        <h3>Harvest Group Management</h3>
        <span className="manage-mode-pill">{isManagingExistingGroup ? 'Edit Mode' : 'Create Mode'}</span>
      </div>
      <p className="manage-helper-text">
        {isManagingExistingGroup
          ? `Editing ${selectedHarvestGroup?.har_grp}`
          : 'Creating a new harvest group'}
      </p>
      <div className="inline-actions">
        {isManagingExistingGroup ? (
          <button type="button" className="ghost-btn small" onClick={onStartNewHarvestGroup} disabled={groupFormSubmitting}>
            Start New Group
          </button>
        ) : (
          <button type="button" className="ghost-btn small" onClick={onCancelNewHarvestGroup} disabled={groupFormSubmitting || harvestGroups.length === 0}>
            Cancel New Group
          </button>
        )}
      </div>

      <form className="data-form" onSubmit={onGroupFormSubmit}>
        <div className="form-grid">
          <label>
            Select Group (to edit or delete)
            <select
              name="group_id"
              value={isManagingExistingGroup ? selectedHarvestGroupId || '' : ''}
              onChange={onGroupFormChange}
            >
              <option value="">Create New</option>
              {harvestGroups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.har_grp} (Room: {group.current_room || 'N/A'})
                </option>
              ))}
            </select>
          </label>

          {!isManagingExistingGroup && (
            <label>
              HG Key (for new group)
              <input
                type="text"
                name="har_grp"
                value={groupFormState.har_grp}
                onChange={onGroupFormChange}
                placeholder="HG-APR-2026-A"
              />
            </label>
          )}

          <label>
            Current Room
            <input
              type="text"
              name="current_room"
              value={groupFormState.current_room}
              onChange={(e) => setGroupFormState(current => ({ ...current, current_room: e.target.value }))}
              placeholder="Flower Room A"
            />
          </label>

          <label className="form-span-full">
            Notes
            <textarea
              rows="2"
              name="notes"
              value={groupFormState.notes}
              onChange={(e) => setGroupFormState(current => ({ ...current, notes: e.target.value }))}
            />
          </label>

          <label className="form-span-full">
            Harvest Group Image
            <input type="file" accept="image/*" onChange={onGroupImageFileChange} />
            {(groupImageFile || groupFormState.image_url) && (
              <img
                className="harvest-group-preview-image"
                src={groupImageFile ? groupImagePreviewUrl : resolveImageUrl(groupFormState.image_url)}
                alt="Harvest group preview"
              />
            )}
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-btn" type="submit" disabled={groupFormSubmitting}>
            {groupFormSubmitting ? 'Saving...' : isManagingExistingGroup ? 'Update Group' : 'Create Group'}
          </button>
          <button
            className="danger-btn"
            type="button"
            onClick={onDeleteHarvestGroup}
            disabled={groupFormSubmitting || !isManagingExistingGroup}
          >
            Delete Selected
          </button>
        </div>
      </form>
    </section>
  );
}
