import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

export const SaveButton = () => {
    const { messages, userPlan, onSaveDocument, isSaving } = useTiptapContext();

    if (userPlan === "free") {
        return null;
    }

    return (
        <MenuButton
            icon="Save"
            text={messages.toolbar.save}
            onClick={onSaveDocument}
            disabled={isSaving}
            tooltip={messages.toolbar.save}
        />
    );
};

export default SaveButton;
