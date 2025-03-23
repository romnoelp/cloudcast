import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const DeleteTaskDialog = ({
  deleteTaskId,
  setDeleteTaskId,
  handleDeleteTask,
}: {
  deleteTaskId: string | null;
  setDeleteTaskId: (id: string | null) => void;
  handleDeleteTask: () => void;
}) => {
  return (
    <AlertDialog
      open={!!deleteTaskId}
      onOpenChange={(open) => !open && setDeleteTaskId(null)}
    >
      <AlertDialogContent className="sm:max-w-md p-6 bg-background rounded-lg shadow-lg border border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end space-x-2">
          <AlertDialogCancel
            onClick={() => setDeleteTaskId(null)}
            className="px-4 py-2 border rounded-md hover:bg-muted"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteTask}
            className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTaskDialog;
