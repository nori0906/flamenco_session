module ProfilesHelper
  def active_class_for_type(type)
    'active' if params[:type] == type
  end
  
  def area_current_for_type(type)
    params[:type] == type ? 'page' : nil
  end
end
