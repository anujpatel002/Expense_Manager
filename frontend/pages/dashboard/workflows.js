import { useState } from 'react';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Plus, Workflow, User, Percent, Crown } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import useSWR from 'swr';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const fetcher = (url) => api.get(url).then((res) => res.data.data);

export default function Workflows() {
  const [showForm, setShowForm] = useState(false);
  const { data: workflowData, error: workflowError, mutate: mutateWorkflows } = useSWR('/workflows', fetcher);
  const { data: userData, error: userError } = useSWR('/users', fetcher);
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      steps: [{ approver: '' }],
      rules: {
        percentageApproval: '',
        finalApprover: ''
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps'
  });

  const workflows = workflowData?.workflows || [];
  const users = userData?.users || [];
  const managers = users.filter(user => user.role === 'Manager' || user.role === 'Admin');

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        rules: {
          percentageApproval: formData.rules.percentageApproval ? parseInt(formData.rules.percentageApproval) : null,
          finalApprover: formData.rules.finalApprover || null
        }
      };
      
      await api.post('/workflows', payload);
      toast.success('Workflow created successfully!');
      reset();
      setShowForm(false);
      mutateWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create workflow');
    }
  };

  if (workflowError || userError) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load data</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Approval Workflows</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Create Workflow'}
          </Button>
        </div>

        {showForm && (
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Workflow Name *</label>
                  <Input
                    {...register('name', { required: 'Workflow name is required' })}
                    placeholder="e.g., Standard Approval Process"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Approval Steps *</label>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <span className="text-sm font-medium w-12">Step {index + 1}:</span>
                        <select
                          {...register(`steps.${index}.approver`, { required: 'Approver is required' })}
                          className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select approver</option>
                          {managers.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ approver: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Advanced Rules (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <Percent className="h-4 w-4 inline mr-1" />
                        Percentage Approval
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...register('rules.percentageApproval')}
                        placeholder="e.g., 60 (for 60%)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Approve when X% of approvers have approved
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <Crown className="h-4 w-4 inline mr-1" />
                        Final Approver
                      </label>
                      <select
                        {...register('rules.finalApprover')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No final approver</option>
                        {managers.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        This person can approve regardless of other rules
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creating...' : 'Create Workflow'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Workflow className="h-5 w-5 mr-2" />
              Existing Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No workflows created yet</p>
                <p className="text-sm text-gray-400">Create your first approval workflow</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">{workflow.name}</h3>
                      <span className="text-sm text-gray-500">
                        Created {new Date(workflow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Approval Steps:</h4>
                        <div className="flex flex-wrap gap-2">
                          {workflow.steps.map((step, index) => (
                            <div key={index} className="flex items-center bg-blue-50 px-3 py-1 rounded-full text-sm">
                              <span className="font-medium mr-2">{index + 1}.</span>
                              <User className="h-3 w-3 mr-1" />
                              {step.approver?.name || 'Unknown User'}
                            </div>
                          ))}
                        </div>
                      </div>

                      {(workflow.rules.percentageApproval || workflow.rules.finalApprover) && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Special Rules:</h4>
                          <div className="flex flex-wrap gap-2">
                            {workflow.rules.percentageApproval && (
                              <div className="flex items-center bg-green-50 px-3 py-1 rounded-full text-sm">
                                <Percent className="h-3 w-3 mr-1" />
                                {workflow.rules.percentageApproval}% Approval
                              </div>
                            )}
                            {workflow.rules.finalApprover && (
                              <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full text-sm">
                                <Crown className="h-3 w-3 mr-1" />
                                Final: {workflow.rules.finalApprover.name}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}