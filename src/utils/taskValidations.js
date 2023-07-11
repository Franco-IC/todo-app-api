export default function taskValidations(APIKey, privilege, task) {
  if (task.length === 0) {
    throw new Error("Task not found");
  }

  if (privilege === "PUBLIC" && task[0].key_used !== APIKey) {
    throw new Error(
      "Public API key users can only modify tasks created by themselves"
    );
  }
}
