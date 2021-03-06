class CreateEmployeesTable < Sequel::Migration
  def up
    create_table(:Employees) do
      primary_key :id
      String :name
      Boolean :supervisor
      Text :notes
    end
  end
  def down
    drop_table(:Employees)
  end
end
